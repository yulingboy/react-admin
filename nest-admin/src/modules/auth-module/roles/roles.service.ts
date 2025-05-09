import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) { }

  /**
   * 创建角色
   * @param createRoleDto 创建角色DTO
   * @returns 创建的角色对象
   */
  async create(createRoleDto: CreateRoleDto) {
    // 检查角色标识是否已存在
    const existingKeyRole = await this.findByKey(createRoleDto.key);
    if (existingKeyRole) {
      throw new ConflictException(`角色标识 ${createRoleDto.key} 已存在`);
    }

    // 检查角色名称是否已存在
    const existingNameRole = await this.findByName(createRoleDto.name);
    if (existingNameRole) {
      throw new ConflictException(`角色名称 ${createRoleDto.name} 已存在`);
    }

    const role = await this.prisma.role.create({
      data: createRoleDto,
    });
    return role;
  }

  /**
   * 分页查询角色列表
   * @param queryRoleDto 查询参数
   * @returns 分页角色列表
   */
  async findAll(queryRoleDto: QueryRoleDto) {
    const { keyword, isSystem, status } = queryRoleDto;
    const { skip, take } = queryRoleDto;

    // 构建查询条件
    const where: Prisma.RoleWhereInput = {
      ...(keyword && {
        OR: [
          { key: { contains: keyword } },
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
      ...(isSystem !== undefined && { isSystem }),
      ...(status !== undefined && { status }),
    };

    // 查询总数
    const total = await this.prisma.role.count({ where });

    // 查询数据
    const roles = await this.prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { User: true },
        },
      },
    });

    // 格式化结果
    const formattedRoles = roles.map((role) => ({
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
      where: { status: StatusEnum.ENABLED },
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
  async update(updateRoleDto: UpdateRoleDto) {
    // 检查角色是否存在
    const role = await this.findOne(updateRoleDto.id);
    if (!role) {
      throw new NotFoundException(`角色不存在`);
    }
    // 系统角色不允许修改
    if (role.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统角色不允许修改`);
    }
    // 检查角色名称是否已存在
    if (updateRoleDto.name) {
      const existingNameRole = await this.findByName(updateRoleDto.name);
      if (existingNameRole && existingNameRole.id !== updateRoleDto.id) {
        throw new ConflictException(`角色名称 ${updateRoleDto.name} 已存在`);
      }
    }
    // 更新角色
    return await this.prisma.role.update({
      where: { id: updateRoleDto.id },
      data: updateRoleDto,
    });
  }

  /**
   * 物理删除角色，包含业务校验逻辑
   * @param id 角色ID
   * @returns 操作结果
   */
  async remove(id: number) {
    // 校验是否存在
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`角色不存在`);
    }

    // 校验是否是系统角色
    if (role.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统角色无法删除`);
    }

    // 检查角色是否被使用
    const isUsed = await this.isRolesUsed(id);

    if (isUsed) {
      throw new ForbiddenException(`该角色已被使用，无法删除`);
    }

    // 物理删除角色
    return await this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 校验角色是否存在
   * @param roleId 角色ID
   * @returns 如果角色存在，返回角色对象；否则返回 null
   */
  async validateRole(roleId: number) {
    const role = this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`角色不存在`);
    }
  }

  /**
   * 根据角色名查询角色
   * @param name 角色名
   * @returns 角色对象或null
   */
  async findByName(name: string) {
    return this.prisma.role.findUnique({ where: { name, status: StatusEnum.ENABLED } });
  }

  /**
   * 根据角色标识查询角色
   * @param key 角色标识
   * @returns 角色对象或null
   */
  async findByKey(key: string) {
    return this.prisma.role.findUnique({ where: { key, status: StatusEnum.ENABLED } });
  }

  /**
   * 校验是否是系统角色，可以传单个角色ID或角色ID数组
   * @param roleId 角色ID或角色ID数组
   * @returns 如果是系统角色，返回 true；否则返回 false
   */
  async isSystemRole(roleId: number | number[]) {
    const roles = await this.prisma.role.findMany({
      where: {
        id: Array.isArray(roleId) ? { in: roleId } : roleId,
        isSystem: IsSystemEnum.YES,
      },
    });
    return roles.length > 0;
  }

  /**
   * 校验角色是否被使用，可以传单个角色ID或角色ID数组
   * @param roleId 角色ID
   * @returns 如果角色被使用，返回 true；否则返回 false
   */
  async isRolesUsed(roleId: number | number[]) {
    const users = await this.prisma.user.findMany({
      where: {
        roleId: Array.isArray(roleId) ? { in: roleId } : roleId,
      },
    });
    return users.length > 0;
  }
}
