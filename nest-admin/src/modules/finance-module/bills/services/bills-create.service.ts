import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateBillDto } from '../dto/create-bill.dto';

/**
 * 账单创建服务类
 * 负责处理账单创建相关的业务逻辑
 */
@Injectable()
export class BillsCreateService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建账单
   * @param createBillDto 创建账单DTO
   * @param userId 用户ID
   * @returns 创建的账单对象
   */
  async create(createBillDto: CreateBillDto, userId: number) {
    // 设置用户ID
    createBillDto.userId = userId;
    
    // 根据账单类型进行不同的验证和处理
    if (createBillDto.type === 'transfer') {
      return this.createTransferBill(createBillDto, userId);
    } else {
      return this.createIncomeOrExpenseBill(createBillDto, userId);
    }
  }

  /**
   * 创建转账类型的账单
   * @param createBillDto 创建账单DTO
   * @param userId 用户ID
   * @returns 创建的账单对象
   */
  private async createTransferBill(createBillDto: CreateBillDto, userId: number) {
    // 转账类型需要验证目标账户
    if (!createBillDto.targetAccountId) {
      throw new BadRequestException('转账类型账单必须提供目标账户ID');
    }
    
    // 转账的源账户和目标账户不能相同
    if (createBillDto.accountId === createBillDto.targetAccountId) {
      throw new BadRequestException('转账的源账户和目标账户不能相同');
    }
    
    // 检查账户是否存在
    const sourceAccount = await this.prisma.account.findFirst({
      where: { id: createBillDto.accountId, userId }
    });
    
    if (!sourceAccount) {
      throw new NotFoundException('源账户不存在');
    }
    
    const targetAccount = await this.prisma.account.findFirst({
      where: { id: createBillDto.targetAccountId, userId }
    });
    
    if (!targetAccount) {
      throw new NotFoundException('目标账户不存在');
    }
    
    // 检查源账户余额是否充足
    if (Number(sourceAccount.balance) < createBillDto.amount) {
      throw new BadRequestException('源账户余额不足');
    }
    
    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 创建账单
      const billData = {
        type: createBillDto.type,
        amount: createBillDto.amount,
        billDate: createBillDto.billDate,
        accountId: createBillDto.accountId,
        targetAccountId: createBillDto.targetAccountId,
        remark: createBillDto.remark,
        images: createBillDto.images,
        location: createBillDto.location,
        status: createBillDto.status,
        userId: createBillDto.userId,
        categoryId: null, // 转账类型没有分类
      };
      
      const bill = await prisma.bill.create({
        data: billData,
      });
      
      // 更新源账户余额
      await prisma.account.update({
        where: { id: createBillDto.accountId },
        data: {
          balance: {
            decrement: createBillDto.amount
          }
        }
      });
      
      // 更新目标账户余额
      await prisma.account.update({
        where: { id: createBillDto.targetAccountId },
        data: {
          balance: {
            increment: createBillDto.amount
          }
        }
      });
      
      // 创建转账记录
      const transferRecord = await prisma.transferRecord.create({
        data: {
          billId: bill.id,
          fromAccountId: createBillDto.accountId,
          toAccountId: createBillDto.targetAccountId,
          amount: createBillDto.amount,
          transferDate: new Date(createBillDto.billDate),
          description: createBillDto.remark,
          userId
        }
      });
      
      // 处理标签关联
      if (createBillDto.tagIds && createBillDto.tagIds.length > 0) {
        const tagLinks = createBillDto.tagIds.map(tagId => ({
          billId: bill.id,
          tagId
        }));
        
        await prisma.billTagLink.createMany({
          data: tagLinks
        });
      }
      
      return bill;
    });
  }

  /**
   * 创建收入或支出类型的账单
   * @param createBillDto 创建账单DTO
   * @param userId 用户ID
   * @returns 创建的账单对象
   */
  private async createIncomeOrExpenseBill(createBillDto: CreateBillDto, userId: number) {
    // 收入和支出类型需要验证分类
    if (!createBillDto.categoryId) {
      throw new BadRequestException('收入或支出类型账单必须提供分类ID');
    }
    
    // 检查账户是否存在
    const account = await this.prisma.account.findFirst({
      where: { id: createBillDto.accountId, userId }
    });
    
    if (!account) {
      throw new NotFoundException('账户不存在');
    }
    
    // 检查分类是否存在
    const category = await this.prisma.billCategory.findFirst({
      where: { 
        id: createBillDto.categoryId,
        OR: [
          { userId },
          { isSystem: 'YES' }
        ]
      }
    });
    
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    
    // 检查分类类型是否与账单类型匹配
    if (category.type !== createBillDto.type) {
      throw new BadRequestException(`分类类型(${category.type})与账单类型(${createBillDto.type})不匹配`);
    }
    
    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 创建账单
      const billData = {
        type: createBillDto.type,
        amount: createBillDto.amount,
        billDate: createBillDto.billDate,
        accountId: createBillDto.accountId,
        targetAccountId: null, // 收入和支出类型没有目标账户
        remark: createBillDto.remark,
        images: createBillDto.images,
        location: createBillDto.location,
        status: createBillDto.status,
        userId: createBillDto.userId,
        categoryId: createBillDto.categoryId,
      };
      
      const bill = await prisma.bill.create({
        data: billData,
      });
      
      // 更新账户余额
      if (createBillDto.type === 'income') {
        // 收入增加账户余额
        await prisma.account.update({
          where: { id: createBillDto.accountId },
          data: {
            balance: {
              increment: createBillDto.amount
            }
          }
        });
      } else {
        // 支出减少账户余额
        await prisma.account.update({
          where: { id: createBillDto.accountId },
          data: {
            balance: {
              decrement: createBillDto.amount
            }
          }
        });
      }
      
      // 处理标签关联
      if (createBillDto.tagIds && createBillDto.tagIds.length > 0) {
        const tagLinks = createBillDto.tagIds.map(tagId => ({
          billId: bill.id,
          tagId
        }));
        
        await prisma.billTagLink.createMany({
          data: tagLinks
        });
      }
      
      return bill;
    });
  }
}