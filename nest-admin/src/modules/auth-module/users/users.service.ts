import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppLoggerService } from 'src/shared/logger/logger.service';
import { hashPassword } from 'src/common/utils/bcrypt';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { RolesService } from '../roles/roles.service';

/**
 * 用户管理服务类
 * 提供用户的增删改查业务逻辑和数据校验
 * @class UsersService
 * @constructor
 * @param {PrismaService} prisma - Prisma服务
 * @param {AppLoggerService} logger - 日志服务
 */
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
    private roleService: RolesService,
  ) {
    this.logger.setContext('UsersService');
  }

  /**
   * 创建用户
   * @param createUserDto 创建用户的参数
   * @returns 创建的用户对象（不含密码）
   * @throws {NotFoundException} 当关联的角色不存在时抛出异常
   * @throws {ConflictException} 当用户名或邮箱已存在时抛出异常
   */
  async create(createUserDto: CreateUserDto) {
    // 检查角色是否存在
    await this.roleService.validateRole(createUserDto.roleId);
    // 检查用户名和邮箱是否已存在
   const isExitUser =  await this.findByUsernameOrEmail(createUserDto.username, createUserDto.email);
    if (isExitUser) {
      throw new ConflictException(`用户名或邮箱已存在`);
    }

    // 对密码进行加密
    const hashedPassword = await hashPassword(createUserDto.password || '123456');
    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        isSystem: IsSystemEnum.NO, // 设置为非系统用户
        password: hashedPassword,
      }
    });

    return user;

  }

  /**
   * 查询用户列表（分页）
   * @param queryUserDto 查询参数
   * @returns 分页的用户列表
   */
  async findAll(queryUserDto: QueryUserDto) {
    const { current = 1, pageSize = 10, keyword, isSystem, status, roleId } = queryUserDto;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where = {
      ...(keyword && {
        OR: [
          { username: { contains: keyword } },
          { email: { contains: keyword } },
          { name: { contains: keyword } },
        ],
      }),
      ...(isSystem && { isSystem: String(isSystem) }),
      ...(status !== undefined && { status: String(status) }),
      ...(roleId && { roleId }),
    };

    // 执行查询
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          avatar: true,
          status: true,
          isSystem: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          Role: { select: { name: true } },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map(user => ({
        ...user,
        roleName: user.Role.name,
        Role: undefined // 移除嵌套的Role对象
      })),
      meta: {
        page: current,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 查询单个用户
   * @param id 用户ID
   * @returns 用户详情
   * @throws {NotFoundException} 当用户不存在时抛出异常
   */
  async findOneById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        status: true,
        roleId: true,
        isSystem: true,
        createdAt: true,
        updatedAt: true,
        Role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    return user;
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param updateUserDto 更新参数
   * @returns 更新后的用户对象
   * @throws {NotFoundException} 当用户不存在时抛出异常
   * @throws {ConflictException} 当用户名或邮箱已被其他用户使用时抛出异常
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    await this.validateUser(id);
    // 检查用户是否为系统用户
    await this.validateIsSystemUser(id);

    // 如果要更新角色，检查角色是否存在
    if (updateUserDto.roleId) {
      await this.roleService.validateRole(updateUserDto.roleId);
    }

    // 如果更新用户名或邮箱，检查是否与其他用户冲突
    if (updateUserDto.username) {
      await this.validateUsername(updateUserDto.username, id);
    }
    if (updateUserDto.email) {
      await this.validateEmail(updateUserDto.email, id);
    }

    // 如果需要更新密码，则进行哈希处理
    let updatedData = { ...updateUserDto };
    if (updateUserDto.password) {
      updatedData.password = await hashPassword(updateUserDto.password);
    }
    // 更新用户信息
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatedData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        status: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        Role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;

  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   * @throws {NotFoundException} 当用户不存在时抛出异常
   * @throws {ForbiddenException} 当尝试删除系统用户时抛出异常
   */
  async remove(id: number) {
    // 检查用户是否存在
    await this.validateUser(id);
    // 检查用户是否为系统用户
    await this.validateIsSystemUser(id);
    // 删除用户
    await this.prisma.user.delete({ where: { id } });

  }

  /**
 * 根据用户名或者邮箱查询用户
 * @param username 用户名
 * @param email 邮箱
 * @returns 用户对象或null
 */
  async findByUsernameOrEmail(username?: string, email?: string) {
    const conditions = [];
    if (username) {
      conditions.push({ username });
    }
    if (email) {
      conditions.push({ email });
    }

    if (conditions.length === 0) {
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });
  }

  /**
   * 验证用户名或邮箱是否已存在
   * @param username 用户名
   * @param email 邮箱
   * @returns 如果存在则返回true，否则返回false
   */
  async validateUsernameAndEmail(username?: string, email?: string): Promise<boolean> {
    const conditions = [];
    if (username) {
      conditions.push({ username });
    }
    if (email) {
      conditions.push({ email });
    }

    if (conditions.length === 0) {
      return false;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });

    if (!user) {
      throw new NotFoundException(`用户名或邮箱不存在`);
    }
  }



  /**
  * 验证用户名是否已存在
  * @param username 用户名
  * @param id 用户ID
  * @throws {ConflictException} 当用户名已被其他用户使用时抛出异常
  */
  private async validateUsername(username: string, id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException(`用户名 '${username}' 已存在`);
    }
  }

  /**
   * 验证邮箱是否已存在
   * @param email 邮箱
   * @param id 用户ID
   * @throws {ConflictException} 当邮箱已被其他用户使用时抛出异常
   */
  private async validateEmail(email: string, id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.id !== id) {
      throw new ConflictException(`邮箱 '${email}' 已存在`);
    }
  }
  /**
   * 验证用户是否存在
   * @param id 用户ID
   * @throws {NotFoundException} 当用户不存在时抛出异常
   */
  private async validateUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
  }
  /**
   * 验证用户是否为系统用户
   * @param id 用户ID
   * @throws {ForbiddenException} 当用户是系统用户时抛出异常
   */
  private async validateIsSystemUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user && user.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统用户不允许操作`);
    }
  }
}
