import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UpdateBillDto } from '../dto/update-bill.dto';

/**
 * 账单更新服务类
 * 负责处理账单更新相关的业务逻辑
 */
@Injectable()
export class BillsUpdateService {
  constructor(private prisma: PrismaService) {}

  /**
   * 更新账单
   * @param id 账单ID
   * @param updateBillDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单
   */
  async update(id: number, updateBillDto: UpdateBillDto, userId: number) {
    // 查找现有账单
    const existingBill = await this.prisma.bill.findFirst({
      where: { id, userId },
      include: {
        billTags: true
      }
    });

    if (!existingBill) {
      throw new NotFoundException(`账单ID ${id} 不存在`);
    }

    // 根据账单类型处理更新
    if (updateBillDto.type === 'transfer') {
      return this.updateTransferBill(id, existingBill, updateBillDto, userId);
    } else {
      return this.updateIncomeOrExpenseBill(id, existingBill, updateBillDto, userId);
    }
  }

  /**
   * 更新转账类型的账单
   * @param id 账单ID
   * @param existingBill 现有账单
   * @param updateBillDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单
   */
  private async updateTransferBill(id: number, existingBill: any, updateBillDto: UpdateBillDto, userId: number) {
    // 转账类型需要验证目标账户
    if (!updateBillDto.targetAccountId) {
      throw new BadRequestException('转账类型账单必须提供目标账户ID');
    }
    
    // 转账的源账户和目标账户不能相同
    if (updateBillDto.accountId === updateBillDto.targetAccountId) {
      throw new BadRequestException('转账的源账户和目标账户不能相同');
    }
    
    // 校验源账户和目标账户是否存在
    const sourceAccount = await this.prisma.account.findFirst({
      where: { id: updateBillDto.accountId, userId }
    });
    
    if (!sourceAccount) {
      throw new NotFoundException('源账户不存在');
    }
    
    const targetAccount = await this.prisma.account.findFirst({
      where: { id: updateBillDto.targetAccountId, userId }
    });
    
    if (!targetAccount) {
      throw new NotFoundException('目标账户不存在');
    }
    
    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 恢复原账单影响的账户余额
      if (existingBill.type === 'transfer') {
        // 如果原账单也是转账类型，恢复原始转账的余额变动
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });

        if (existingBill.targetAccountId) {
          await prisma.account.update({
            where: { id: existingBill.targetAccountId },
            data: {
              balance: {
                decrement: existingBill.amount
              }
            }
          });
        }
      } else if (existingBill.type === 'income') {
        // 如果原账单是收入类型，减少原账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              decrement: existingBill.amount
            }
          }
        });
      } else if (existingBill.type === 'expense') {
        // 如果原账单是支出类型，增加原账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });
      }
      
      // 更新账单记录
      const bill = await prisma.bill.update({
        where: { id },
        data: {
          ...updateBillDto,
          categoryId: null, // 转账类型没有分类
        },
      });
      
      // 应用新的转账余额变动
      await prisma.account.update({
        where: { id: updateBillDto.accountId },
        data: {
          balance: {
            decrement: updateBillDto.amount
          }
        }
      });
      
      await prisma.account.update({
        where: { id: updateBillDto.targetAccountId },
        data: {
          balance: {
            increment: updateBillDto.amount
          }
        }
      });
      
      // 更新或创建转账记录
      const transferRecord = await prisma.transferRecord.findFirst({
        where: { 
          id: existingBill.transferId 
        }
      });
      
      if (transferRecord) {
        await prisma.transferRecord.update({
          where: { id: transferRecord.id },
          data: {
            fromAccountId: updateBillDto.accountId,
            toAccountId: updateBillDto.targetAccountId,
            amount: updateBillDto.amount,
            transferDate: new Date(updateBillDto.billDate),
            description: updateBillDto.remark
          }
        });
      } else {
        // 创建新的转账记录
        const newTransfer = await prisma.transferRecord.create({
          data: {
            fromAccountId: updateBillDto.accountId,
            toAccountId: updateBillDto.targetAccountId,
            amount: updateBillDto.amount,
            transferDate: new Date(updateBillDto.billDate),
            description: updateBillDto.remark,
            userId
          }
        });
        
        // 更新账单关联转账记录
        await prisma.bill.update({
          where: { id },
          data: { transferId: newTransfer.id }
        });
      }
      
      // 处理标签关联
      // 首先删除所有现有标签关联
      await prisma.billTagLink.deleteMany({
        where: { billId: id }
      });
      
      // 添加新的标签关联
      if (updateBillDto.tagIds && updateBillDto.tagIds.length > 0) {
        const tagLinks = updateBillDto.tagIds.map(tagId => ({
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
   * 更新收入或支出类型的账单
   * @param id 账单ID
   * @param existingBill 现有账单
   * @param updateBillDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单
   */
  private async updateIncomeOrExpenseBill(id: number, existingBill: any, updateBillDto: UpdateBillDto, userId: number) {
    // 收入和支出类型需要验证分类
    if (!updateBillDto.categoryId) {
      throw new BadRequestException('收入或支出类型账单必须提供分类ID');
    }
    
    // 检查账户是否存在
    const account = await this.prisma.account.findFirst({
      where: { id: updateBillDto.accountId, userId }
    });
    
    if (!account) {
      throw new NotFoundException('账户不存在');
    }
    
    // 检查分类是否存在
    const category = await this.prisma.billCategory.findFirst({
      where: { 
        id: updateBillDto.categoryId,
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
    if (category.type !== updateBillDto.type) {
      throw new BadRequestException(`分类类型(${category.type})与账单类型(${updateBillDto.type})不匹配`);
    }
    
    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 恢复原账单影响的账户余额
      if (existingBill.type === 'transfer') {
        // 如果原账单是转账类型，恢复原始转账的余额变动
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });

        if (existingBill.targetAccountId) {
          await prisma.account.update({
            where: { id: existingBill.targetAccountId },
            data: {
              balance: {
                decrement: existingBill.amount
              }
            }
          });
        }
        
        // 如果存在转账记录，需要删除
        if (existingBill.transferId) {
          await prisma.transferRecord.delete({
            where: { id: existingBill.transferId }
          });
        }
      } else if (existingBill.type === 'income') {
        // 如果原账单是收入类型，减少原账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              decrement: existingBill.amount
            }
          }
        });
      } else if (existingBill.type === 'expense') {
        // 如果原账单是支出类型，增加原账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });
      }

      // 更新账单记录
      const bill = await prisma.bill.update({
        where: { id },
        data: {
          ...updateBillDto,
          targetAccountId: null, // 收入和支出类型没有目标账户
          transferId: null, // 收入和支出类型没有关联转账记录
        },
      });
      
      // 更新账户余额
      if (updateBillDto.type === 'income') {
        // 收入增加账户余额
        await prisma.account.update({
          where: { id: updateBillDto.accountId },
          data: {
            balance: {
              increment: updateBillDto.amount
            }
          }
        });
      } else if (updateBillDto.type === 'expense') {
        // 支出减少账户余额
        await prisma.account.update({
          where: { id: updateBillDto.accountId },
          data: {
            balance: {
              decrement: updateBillDto.amount
            }
          }
        });
      }
      
      // 处理标签关联
      // 首先删除所有现有标签关联
      await prisma.billTagLink.deleteMany({
        where: { billId: id }
      });
      
      // 添加新的标签关联
      if (updateBillDto.tagIds && updateBillDto.tagIds.length > 0) {
        const tagLinks = updateBillDto.tagIds.map(tagId => ({
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