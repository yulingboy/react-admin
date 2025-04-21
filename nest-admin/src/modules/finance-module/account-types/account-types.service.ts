import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { QueryAccountTypeDto } from './dto/query-account-type.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class AccountTypesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建账户类型
   * @param createAccountTypeDto 创建账户类型DTO
   * @returns 创建的账户类型对象
   */
  async create(createAccountTypeDto: CreateAccountTypeDto) {
    // 检查账户类型名称是否已存在
    const existingNameType = await this.findByName(createAccountTypeDto.name);
    if (existingNameType) {
      throw new ConflictException(`账户类型名称 ${createAccountTypeDto.name} 已存在`);
    }
    
    const accountType = await this.prisma.accountType.create({
      data: createAccountTypeDto,
    });
    return accountType;
  }

  /**
   * 分页查询账户类型列表
   * @param queryAccountTypeDto 查询参数
   * @returns 分页账户类型列表
   */
  async findAll(queryAccountTypeDto: QueryAccountTypeDto) {
    const { keyword, isSystem, status } = queryAccountTypeDto;
    const { skip, take } = queryAccountTypeDto;

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
      ];
    }

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    if (status !== undefined) {
      where.status = status;
    }

    // 查询总数
    const total = await this.prisma.accountType.count({ where });

    // 查询数据
    const accountTypes = await this.prisma.accountType.findMany({
      where,
      skip,
      take,
      orderBy: { sort: 'asc' },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });

    // 格式化结果
    const formattedAccountTypes = accountTypes.map((type) => ({
      ...type,
      accountCount: type._count.accounts,
      _count: undefined,
    }));

    return {
      items: formattedAccountTypes,
      meta: {
        page: queryAccountTypeDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取所有账户类型（不分页，用于下拉选择）
   * @returns 所有账户类型列表
   */
  async findAllOptions() {
    return await this.prisma.accountType.findMany({
      where: { status: StatusEnum.ENABLED },
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
      },
      orderBy: { sort: 'asc' },
    });
  }

  /**
   * 根据ID查询账户类型
   * @param id 账户类型ID
   * @returns 账户类型详情
   */
  async findOne(id: number) {
    const accountType = await this.prisma.accountType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });

    if (!accountType) {
      throw new NotFoundException(`ID为${id}的账户类型不存在`);
    }

    // 格式化结果
    return {
      ...accountType,
      accountCount: accountType._count.accounts,
      _count: undefined,
    };
  }

  /**
   * 更新账户类型
   * @param id 账户类型ID
   * @param updateAccountTypeDto 更新参数
   * @returns 更新后的账户类型
   */
  async update(id: number, updateAccountTypeDto: UpdateAccountTypeDto) {
    // 如果更新了名称，检查名称是否已存在
    if (updateAccountTypeDto.name) {
      const existingType = await this.prisma.accountType.findFirst({
        where: {
          name: updateAccountTypeDto.name,
          id: { not: id },
        },
      });
      
      if (existingType) {
        throw new ConflictException(`账户类型名称 ${updateAccountTypeDto.name} 已存在`);
      }
    }
    
    // 更新账户类型
    const accountType = await this.prisma.accountType.update({
      where: { id },
      data: updateAccountTypeDto,
    });
    return accountType;
  }

  /**
   * 物理删除账户类型，包含业务校验逻辑
   * @param id 账户类型ID
   * @returns 操作结果
   */
  async remove(id: number) {
    // 校验是否存在
    const accountType = await this.findOne(id);
    if (!accountType) {
      throw new NotFoundException(`账户类型不存在`);
    }

    // 校验是否是系统账户类型
    if (accountType.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统账户类型无法删除`);
    }

    // 检查账户类型是否被使用
    const accounts = await this.prisma.account.findMany({
      where: { typeId: id },
    });

    if (accounts.length > 0) {
      throw new ForbiddenException(`该账户类型已被使用，无法删除`);
    }

    // 物理删除账户类型
    return await this.prisma.accountType.delete({
      where: { id },
    });
  }

  /**
   * 批量物理删除账户类型，包含业务校验逻辑
   * @param ids 账户类型ID数组
   * @returns 操作结果
   */
  async batchRemove(ids: number[]) {
    // 检查账户类型是否存在
    const accountTypes = await this.prisma.accountType.findMany({
      where: { id: { in: ids } },
    });

    if (accountTypes.length !== ids.length) {
      throw new NotFoundException(`部分账户类型不存在`);
    }

    // 检查是否包含系统账户类型
    const systemTypes = accountTypes.filter((type) => type.isSystem === IsSystemEnum.YES);
    if (systemTypes.length > 0) {
      throw new ForbiddenException(`系统账户类型不允许删除`);
    }

    // 检查账户类型是否有关联账户
    const accountCount = await this.prisma.account.count({
      where: { typeId: { in: ids } },
    });

    if (accountCount > 0) {
      throw new ForbiddenException(`选中的账户类型中有${accountCount}个账户关联，不允许删除`);
    }

    // 批量物理删除
    return this.prisma.accountType.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * 根据账户类型名查询账户类型
   * @param name 账户类型名
   * @returns 账户类型对象或null
   */
  async findByName(name: string) {
    return this.prisma.accountType.findFirst({ where: { name, status: StatusEnum.ENABLED } });
  }
}