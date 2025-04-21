import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 账单删除服务类
 * 负责处理账单删除相关的业务逻辑
 */
@Injectable()
export class BillsDeleteService {
  constructor(private prisma: PrismaService) {}

  /**
   * 删除账单
   * @param id 账单ID
   * @param userId 用户ID
   * @returns 删除结果
   */
  async remove(id: number, userId: number) {
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

    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 处理账户余额影响
      if (existingBill.type === 'transfer') {
        // 恢复转账影响的两个账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });

        await prisma.account.update({
          where: { id: existingBill.targetAccountId },
          data: {
            balance: {
              decrement: existingBill.amount
            }
          }
        });
        
        // 删除转账记录
        await prisma.transferRecord.deleteMany({
          where: { billId: id }
        });
      } else if (existingBill.type === 'income') {
        // 恢复收入影响的账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              decrement: existingBill.amount
            }
          }
        });
      } else if (existingBill.type === 'expense') {
        // 恢复支出影响的账户余额
        await prisma.account.update({
          where: { id: existingBill.accountId },
          data: {
            balance: {
              increment: existingBill.amount
            }
          }
        });
      }

      // 删除账单标签关联
      await prisma.billTagLink.deleteMany({
        where: { billId: id }
      });
      
      // 删除账单记录
      return prisma.bill.delete({
        where: { id }
      });
    });
  }

  /**
   * 批量删除账单
   * @param ids 账单ID数组
   * @param userId 用户ID
   * @returns 删除结果
   */
  async batchRemove(ids: number[], userId: number) {
    // 查找所有待删除的账单
    const existingBills = await this.prisma.bill.findMany({
      where: { 
        id: { in: ids },
        userId 
      },
      include: {
        billTags: true
      }
    });

    if (existingBills.length === 0) {
      throw new NotFoundException('未找到需要删除的账单');
    }

    // 开启事务处理
    return await this.prisma.$transaction(async (prisma) => {
      // 处理每个账单的余额影响
      for (const bill of existingBills) {
        if (bill.type === 'transfer') {
          // 恢复转账影响的两个账户余额
          await prisma.account.update({
            where: { id: bill.accountId },
            data: {
              balance: {
                increment: bill.amount
              }
            }
          });

          await prisma.account.update({
            where: { id: bill.targetAccountId },
            data: {
              balance: {
                decrement: bill.amount
              }
            }
          });
        } else if (bill.type === 'income') {
          // 恢复收入影响的账户余额
          await prisma.account.update({
            where: { id: bill.accountId },
            data: {
              balance: {
                decrement: bill.amount
              }
            }
          });
        } else if (bill.type === 'expense') {
          // 恢复支出影响的账户余额
          await prisma.account.update({
            where: { id: bill.accountId },
            data: {
              balance: {
                increment: bill.amount
              }
            }
          });
        }
      }

      // 删除关联的转账记录
      await prisma.transferRecord.deleteMany({
        where: { 
          billId: { in: ids }
        }
      });

      // 删除账单标签关联
      await prisma.billTagLink.deleteMany({
        where: { 
          billId: { in: ids }
        }
      });
      
      // 删除账单记录
      return prisma.bill.deleteMany({
        where: { 
          id: { in: ids },
          userId
        }
      });
    });
  }
}