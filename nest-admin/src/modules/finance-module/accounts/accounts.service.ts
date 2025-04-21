import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { QueryAccountDto } from './dto/query-account.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { StatusEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建账户
   * @param createAccountDto 创建账户DTO
   * @param userId 用户ID
   * @returns 创建的账户对象
   */
  async create(createAccountDto: CreateAccountDto, userId: number) {
    // 设置用户ID
    createAccountDto.userId = userId;
    
    // 检查账户名称是否已存在
    const existingAccount = await this.findByName(createAccountDto.name, userId);
    if (existingAccount) {
      throw new ConflictException(`账户名称 ${createAccountDto.name} 已存在`);
    }
    
    // 检查账户类型是否存在
    const accountType = await this.prisma.accountType.findUnique({
      where: { id: createAccountDto.typeId },
    });
    
    if (!accountType) {
      throw new NotFoundException(`账户类型不存在`);
    }
    
    // 如果设置为默认账户，需要将其他账户设置为非默认
    if (createAccountDto.isDefault === '1') {
      await this.resetDefaultAccount(userId);
    }
    
    // 将DTO转换为Prisma可接受的格式
    const accountData = {
      name: createAccountDto.name,
      typeId: createAccountDto.typeId,
      balance: createAccountDto.balance,
      icon: createAccountDto.icon,
      color: createAccountDto.color,
      userId: createAccountDto.userId,
      status: createAccountDto.status,
      isDefault: createAccountDto.isDefault,
      sort: createAccountDto.sort,
    };
    
    const account = await this.prisma.account.create({
      data: accountData,
    });
    
    return account;
  }

  /**
   * 分页查询账户列表
   * @param queryAccountDto 查询参数
   * @param userId 用户ID
   * @returns 分页账户列表
   */
  async findAll(queryAccountDto: QueryAccountDto, userId: number) {
    const { keyword, typeId, status, isDefault } = queryAccountDto;
    const { skip, take } = queryAccountDto;

    // 构建查询条件
    const where: any = { userId };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
      ];
    }

    if (typeId !== undefined) {
      where.typeId = typeId;
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (isDefault !== undefined) {
      where.isDefault = isDefault;
    }

    // 查询总数
    const total = await this.prisma.account.count({ where });

    // 查询数据
    const accounts = await this.prisma.account.findMany({
      where,
      skip,
      take,
      orderBy: [
        { isDefault: 'desc' },
        { sort: 'asc' }
      ],
      include: {
        type: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    });

    return {
      items: accounts,
      meta: {
        page: queryAccountDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取所有账户（不分页，用于下拉选择）
   * @param userId 用户ID
   * @returns 所有账户列表
   */
  async findAllOptions(userId: number) {
    return await this.prisma.account.findMany({
      where: { 
        userId,
        status: StatusEnum.ENABLED 
      },
      select: {
        id: true,
        name: true,
        balance: true,
        icon: true,
        color: true,
        type: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { sort: 'asc' }
      ],
    });
  }

  /**
   * 根据ID查询账户
   * @param id 账户ID
   * @param userId 用户ID
   * @returns 账户详情
   */
  async findOne(id: number, userId: number) {
    const account = await this.prisma.account.findFirst({
      where: { 
        id, 
        userId 
      },
      include: {
        type: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`ID为${id}的账户不存在`);
    }

    return account;
  }

  /**
   * 更新账户
   * @param id 账户ID
   * @param updateAccountDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账户
   */
  async update(id: number, updateAccountDto: UpdateAccountDto, userId: number) {
    // 检查账户是否存在
    await this.findOne(id, userId);
    
    // 如果更新了名称，检查名称是否已存在
    if (updateAccountDto.name) {
      const existingAccount = await this.prisma.account.findFirst({
        where: {
          name: updateAccountDto.name,
          userId,
          id: { not: id },
        },
      });
      
      if (existingAccount) {
        throw new ConflictException(`账户名称 ${updateAccountDto.name} 已存在`);
      }
    }
    
    // 如果更新了账户类型，检查账户类型是否存在
    if (updateAccountDto.typeId) {
      const accountType = await this.prisma.accountType.findUnique({
        where: { id: updateAccountDto.typeId },
      });
      
      if (!accountType) {
        throw new NotFoundException(`账户类型不存在`);
      }
    }
    
    // 如果设置为默认账户，需要将其他账户设置为非默认
    if (updateAccountDto.isDefault === '1') {
      await this.resetDefaultAccount(userId);
    }
    
    // 更新账户
    const account = await this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
    
    return account;
  }

  /**
   * 调整账户余额
   * @param adjustBalanceDto 调整余额参数
   * @param userId 用户ID
   * @returns 调整后的账户
   */
  async adjustBalance(adjustBalanceDto: AdjustBalanceDto, userId: number) {
    const { id, balance, reason } = adjustBalanceDto;
    
    // 检查账户是否存在
    const account = await this.findOne(id, userId);
    
    // 记录余额调整日志
    await this.prisma.balanceAdjustLog.create({
      data: {
        accountId: id,
        previousBalance: account.balance,
        newBalance: balance,
        reason: reason || '手动调整',
        userId,
      },
    });
    
    // 更新账户余额
    return await this.prisma.account.update({
      where: { id },
      data: { balance },
    });
  }

  /**
   * 物理删除账户，包含业务校验逻辑
   * @param id 账户ID
   * @param userId 用户ID
   * @returns 操作结果
   */
  async remove(id: number, userId: number) {
    // 校验是否存在
    const account = await this.findOne(id, userId);
    
    // 检查账户是否有关联账单
    const billCount = await this.prisma.bill.count({
      where: {
        OR: [
          { accountId: id },
        ],
      },
    });

    if (billCount > 0) {
      throw new ForbiddenException(`该账户已被账单使用，无法删除`);
    }
    
    // 检查账户是否有关联转账记录
    const transferCount = await this.prisma.transferRecord.count({
      where: {
        OR: [
          { fromAccountId: id },
          { toAccountId: id },
        ],
      },
    });

    if (transferCount > 0) {
      throw new ForbiddenException(`该账户已被转账记录使用，无法删除`);
    }

    // 物理删除账户
    return await this.prisma.account.delete({
      where: { id },
    });
  }

  /**
   * 批量物理删除账户，包含业务校验逻辑
   * @param ids 账户ID数组
   * @param userId 用户ID
   * @returns 操作结果
   */
  async batchRemove(ids: number[], userId: number) {
    // 检查账户是否存在
    const accounts = await this.prisma.account.findMany({
      where: { 
        id: { in: ids },
        userId
      },
    });

    if (accounts.length !== ids.length) {
      throw new NotFoundException(`部分账户不存在`);
    }

    // 检查账户是否有关联账单
    const billCount = await this.prisma.bill.count({
      where: {
        OR: [
          { accountId: { in: ids } },
        ],
      },
    });

    if (billCount > 0) {
      throw new ForbiddenException(`选中的账户中有账单关联，不允许删除`);
    }
    
    // 检查账户是否有关联转账记录
    const transferCount = await this.prisma.transferRecord.count({
      where: {
        OR: [
          { fromAccountId: { in: ids } },
          { toAccountId: { in: ids } },
        ],
      },
    });

    if (transferCount > 0) {
      throw new ForbiddenException(`选中的账户中有转账记录关联，不允许删除`);
    }

    // 批量物理删除
    return this.prisma.account.deleteMany({
      where: { 
        id: { in: ids },
        userId
      },
    });
  }

  /**
   * 根据账户名查询账户
   * @param name 账户名
   * @param userId 用户ID
   * @returns 账户对象或null
   */
  async findByName(name: string, userId: number) {
    return this.prisma.account.findFirst({ 
      where: { 
        name,
        userId,
        status: StatusEnum.ENABLED 
      } 
    });
  }
  
  /**
   * 重置默认账户（将所有账户设置为非默认）
   * @param userId 用户ID
   */
  private async resetDefaultAccount(userId: number) {
    await this.prisma.account.updateMany({
      where: { 
        userId,
        isDefault: '1' 
      },
      data: { isDefault: '0' }
    });
  }
}