import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { hash } from "bcryptjs";
import { AppLoggerService } from '../../shared/logger/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  /**
   * 构造函数，注入Prisma服务
   * @param prisma Prisma服务实例
   */
  constructor(
    private prisma: PrismaService,
    private logger: AppLoggerService,
  ) {
    this.logger.setContext('UsersService');
  }

  /**
   * 创建用户
   * @param createUserDto 创建用户DTO
   * @returns 创建的用户对象（不含密码）
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
    
    try {
      // 对密码进行加密
      const hashedPassword = await hash(createUserDto.password, 10);
      
      // 创建用户
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
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
      // 处理唯一约束冲突
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('username')) {
          this.logger.warn(`创建用户失败: 用户名 '${createUserDto.username}' 已存在`);
          throw new ConflictException('用户名已存在');
        } else if (target?.includes('email')) {
          this.logger.warn(`创建用户失败: 邮箱 '${createUserDto.email}' 已存在`);
          throw new ConflictException('邮箱已存在');
        }
      }
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 分页查询用户列表
   * @param queryUserDto 查询参数
   * @returns 分页用户列表
   */
  async findAll(queryUserDto: QueryUserDto) {
    this.logger.log(`查询用户列表: ${JSON.stringify(queryUserDto)}`);
    
    const { username, email, status, roleId } = queryUserDto;
    const { skip, take } = queryUserDto;
    
    // 构建查询条件
    const where: any = {};
    
    if (username) {
      where.username = { contains: username };
    }
    
    if (email) {
      where.email = { contains: email };
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (roleId) {
      where.roleId = roleId;
    }
    
    // 查询总数
    const total = await this.prisma.user.count({ where });
    
    // 查询数据
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
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
    
    this.logger.debug(`用户列表查询结果: 共 ${total} 条记录`);
    return {
      items: users,
      meta: {
        page: queryUserDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 根据ID查询用户
   * @param id 用户ID
   * @returns 用户详情（不含密码）
   */
  async findOne(id: number) {
    this.logger.log(`查询用户详情: ID=${id}`);
    
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
        createdAt: true,
        updatedAt: true,
        Role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    
    if (!user) {
      this.logger.warn(`用户不存在: ID=${id}`);
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }
    
    this.logger.debug(`查询到用户: ${user.username}`);
    return user;
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 更新参数
   * @returns 更新后的用户信息（不含密码）
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log(`准备更新用户: ID=${id}, 数据=${JSON.stringify(updateUserDto)}`);
    
    // 检查用户是否存在
    await this.findOne(id);
    
    const updateData: any = { ...updateUserDto };
    
    // 如果包含密码，需要加密
    if (updateData.password) {
      updateData.password = await hash(updateData.password, 10);
    }
    
    // 如果要更新角色，检查角色是否存在
    if (updateData.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateData.roleId },
      });
      
      if (!role) {
        this.logger.warn(`角色ID不存在: ${updateData.roleId}`);
        throw new NotFoundException(`ID为${updateData.roleId}的角色不存在`);
      }
    }
    
    try {
      // 更新用户
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
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
      
      this.logger.log(`用户更新成功: ${user.username} (ID: ${user.id})`);
      return user;
    } catch (error) {
      // 处理唯一约束冲突
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('username')) {
          this.logger.warn(`更新用户失败: 用户名冲突`);
          throw new ConflictException('用户名已存在');
        } else if (target?.includes('email')) {
          this.logger.warn(`更新用户失败: 邮箱冲突`);
          throw new ConflictException('邮箱已存在');
        }
      }
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 操作结果
   */
  async remove(id: number) {
    this.logger.log(`准备删除用户: ID=${id}`);
    
    // 检查用户是否存在
    await this.findOne(id);
    
    // 删除用户
    await this.prisma.user.delete({ where: { id } });
    
    this.logger.log(`用户删除成功: ID=${id}`);
    return { success: true, message: '用户删除成功' };
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户对象或null
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户对象或null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
