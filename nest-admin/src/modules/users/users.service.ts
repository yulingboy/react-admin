import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AppLoggerService } from 'src/shared/logger/logger.service';
import { hashPassword } from 'src/common/utils/bcrypt';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

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
    this.logger.log(`准备创建用户: ${createUserDto.username}`);

    // 检查角色是否存在
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      this.logger.warn(`角色ID不存在: ${createUserDto.roleId}`);
      throw new NotFoundException(`ID为${createUserDto.roleId}的角色不存在`);
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await this.findByUsernameOrEmail(createUserDto.username, createUserDto.email);
    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        this.logger.warn(`创建用户失败: 用户名 '${createUserDto.username}' 已存在`);
        throw new ConflictException(`用户名 '${createUserDto.username}' 已存在`);
      }
      if (existingUser.email === createUserDto.email) {
        this.logger.warn(`创建用户失败: 邮箱 '${createUserDto.email}' 已存在`);
        throw new ConflictException(`邮箱 '${createUserDto.email}' 已存在`);
      }
    }

    try {
      // 对密码进行加密
      const hashedPassword = await hashPassword(createUserDto.password);

      // 创建用户
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          isSystem: IsSystemEnum.NO, // 设置为非系统用户
          password: hashedPassword,
        },
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

      this.logger.log(`用户创建成功: ${user.username} (ID: ${user.id})`);
      return user;
    } catch (error) {
      // 处理其他可能的错误（如数据库连接错误等）
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询用户列表（分页）
   * @param queryUserDto 查询参数
   * @returns 分页的用户列表
   */
  async findAll(queryUserDto: QueryUserDto) {
    const { current = 1, pageSize = 10, username, email, status, roleId } = queryUserDto;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    
    if (username) {
      where.username = {
        contains: username,
      };
    }
    
    if (email) {
      where.email = {
        contains: email,
      };
    }
    
    if (status !== undefined) {
      where.status = String(status); // 确保 status 是字符串类型
    }
    
    if (roleId) {
      where.roleId = roleId;
    }

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
          Role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // 扁平化用户数据
    const data = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      status: user.status,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roleName: user.Role.name,
      isSystem: user.isSystem,
    }));

    return {
      items: data,
      meta: {
        page: current,
        pageSize: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 如果要更新角色，检查角色是否存在
    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });
      if (!role) {
        throw new NotFoundException(`ID为${updateUserDto.roleId}的角色不存在`);
      }
    }

    // 如果更新用户名或邮箱，检查是否与其他用户冲突
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username }
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`用户名 '${updateUserDto.username}' 已存在`);
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`邮箱 '${updateUserDto.email}' 已存在`);
      }
    }

    // 如果需要更新密码，则进行哈希处理
    let updatedData = { ...updateUserDto };
    if (updateUserDto.password) {
      updatedData.password = await hashPassword(updateUserDto.password);
    }

    try {
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

      this.logger.log(`用户更新成功: ${updatedUser.username} (ID: ${updatedUser.id})`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除结果
   * @throws {NotFoundException} 当用户不存在时抛出异常
   * @throws {ForbiddenException} 当尝试删除系统用户时抛出异常
   */
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 检查是否为系统用户
    if (user.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统用户不允许删除`);
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`用户删除成功: ID=${id}`);

    return { message: `用户ID为${id}的用户已删除` };
  }

  /**
   * 批量删除用户
   * @param ids 用户ID数组
   * @returns 删除结果
   * @throws {ForbiddenException} 当尝试删除系统用户时抛出异常
   */
  async batchRemove(ids: number[]) {
    // 检查是否包含系统用户
    const systemUsers = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
        isSystem: IsSystemEnum.YES,
      },
    });

    if (systemUsers.length > 0) {
      const systemUserNames = systemUsers.map(user => user.username).join(', ');
      throw new ForbiddenException(`系统用户不允许删除: ${systemUserNames}`);
    }

    // 检查所有用户是否存在
    const usersCount = await this.prisma.user.count({
      where: { id: { in: ids } },
    });

    if (usersCount !== ids.length) {
      throw new NotFoundException(`部分用户不存在`);
    }

    await this.prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    this.logger.log(`批量删除用户成功: ID=${ids.join(',')}`);
    return { message: `用户ID为${ids.join(',')}的用户已删除` };
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

    return !!user;
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
}
