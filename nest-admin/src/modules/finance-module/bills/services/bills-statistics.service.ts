import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 账单统计服务类
 * 负责处理账单统计相关的业务逻辑
 */
@Injectable()
export class BillsStatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取账单统计数据
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据对象
   */
  async getStatistics(userId: number, startDate: string, endDate: string) {
    // 构建查询条件
    const where = {
      userId,
      billDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // 统计收入
    const income = await this.prisma.bill.aggregate({
      where: {
        ...where,
        type: 'income',
      },
      _sum: {
        amount: true,
      },
    });

    // 统计支出
    const expense = await this.prisma.bill.aggregate({
      where: {
        ...where,
        type: 'expense',
      },
      _sum: {
        amount: true,
      },
    });

    // 统计转账
    const transfer = await this.prisma.bill.aggregate({
      where: {
        ...where,
        type: 'transfer',
      },
      _sum: {
        amount: true,
      },
    });

    // 使用 Number() 将 Decimal 类型转换为数字类型进行计算
    const incomeAmount = income._sum.amount ? Number(income._sum.amount) : 0;
    const expenseAmount = expense._sum.amount ? Number(expense._sum.amount) : 0;
    const transferAmount = transfer._sum.amount ? Number(transfer._sum.amount) : 0;

    return {
      income: incomeAmount,
      expense: expenseAmount,
      transfer: transferAmount,
      balance: incomeAmount - expenseAmount,
    };
  }
}