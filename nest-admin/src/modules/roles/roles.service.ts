import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RolesService {
  /**
   * 构造函数，注入Prisma服务
   * @param prisma Prisma服务实例
   */
  constructor(private prisma: PrismaService) {}

  /**
   * 创建角色
   * @param createRoleDto 创建角色DTO
   * @returns 创建的角色对象
   */
  async create(createRoleDto: CreateRoleDto) {
    try {
      // 创建角色
      const role = await this.prisma.role.create({
        data: createRoleDto,
      });
      
      return role;
    } catch (error) {
      // 处理唯一约束冲突
      if (error.code === 'P2002') {
        throw new ConflictException('角色名已存在');
      }
      throw error;
    }
  }

  /**
   * 分页查询角色列表
   * @param queryRoleDto 查询参数
   * @returns 分页角色列表
   */
  async findAll(queryRoleDto: QueryRoleDto) {
    const { name, status } = queryRoleDto;
    const { skip, take } = queryRoleDto;
    
    // 构建查询条件
    const where: any = {};
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    // 查询总数
    const total = await this.prisma.role.count({ where });
    
    // 查询数据
    const roles = await this.prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { User: true },
        },
      },
    });
    
    // 格式化结果
    const formattedRoles = roles.map(role => ({
      ...role,
      userCount: role._count.User,
      _count: undefined,
    }));
    
    return {
      items: formattedRoles,
      meta: {
        page: queryRoleDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取所有角色（不分页，用于下拉选择）
   * @returns 所有角色列表
   */
  async findAllOptions() {
    return await this.prisma.role.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 根据ID查询角色
   * @param id 角色ID
   * @returns 角色详情
   */
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { User: true },
        },
      },
    });
    
    if (!role) {
      throw new NotFoundException(`ID为${id}的角色不存在`);
    }
    
    // 格式化结果
    return {
      ...role,
      userCount: role._count.User,
      _count: undefined,
    };
  }

  /**
   * 更新角色
   * @param id 角色ID
   * @param updateRoleDto 更新参数
   * @returns 更新后的角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    // 检查角色是否存在
    await this.findOne(id);
    
    try {
      // 更新角色
      const role = await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      });
      
      return role;
    } catch (error) {
      // 处理唯一约束冲突
      if (error.code === 'P2002') {
        throw new ConflictException('角色名已存在');
      }
      throw error;
    }
  }

  /**
   * 删除角色
   * @param id 角色ID
   * @returns 操作结果
   */
  async remove(id: number) {
    // 检查角色是否存在
    const role = await this.findOne(id);
    
    // 检查角色是否被用户使用
    if (role.userCount > 0) {
      throw new ConflictException('该角色下有用户，不能删除');
    }
    
    // 删除角色
    await this.prisma.role.delete({ where: { id } });
    
    return { success: true, message: '角色删除成功' };
  }
}
