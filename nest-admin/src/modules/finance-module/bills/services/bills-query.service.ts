import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { QueryBillDto } from '../dto/query-bill.dto';
import { Prisma } from '@prisma/client';

/**
 * 账单查询服务类
 * 负责处理账单查询相关的业务逻辑
 */
@Injectable()
export class BillsQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * 分页查询账单列表
   * @param queryBillDto 查询参数
   * @param userId 用户ID
   * @returns 分页账单列表
   */
  async findAll(queryBillDto: QueryBillDto, userId: number) {
    const { 
      keyword, status, type, accountId, categoryId, tagId,
      startDate, endDate, minAmount, maxAmount,
      sortField, sortOrder
    } = queryBillDto;
    const { skip, take } = queryBillDto;

    // 构建查询条件
    const where: Prisma.BillWhereInput = { userId };

    if (keyword) {
      where.description = { contains: keyword };
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (type !== undefined && type !== '') {
      where.type = type;
    }
    
    if (accountId !== undefined) {
      where.OR = [
        { accountId },
        { targetAccountId: accountId }
      ];
    }
    
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }
    
    if (tagId !== undefined) {
      where.billTags = {
        some: {
          tagId
        }
      };
    }
    
    if (startDate && endDate) {
      where.billDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.billDate = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.billDate = {
        lte: new Date(endDate)
      };
    }
    
    if (minAmount !== undefined && maxAmount !== undefined) {
      where.amount = {
        gte: minAmount,
        lte: maxAmount
      };
    } else if (minAmount !== undefined) {
      where.amount = {
        gte: minAmount
      };
    } else if (maxAmount !== undefined) {
      where.amount = {
        lte: maxAmount
      };
    }

    // 查询总数
    const total = await this.prisma.bill.count({ where });

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortField || 'billDate'] = sortOrder || 'desc';

    // 查询数据
    const bills = await this.prisma.bill.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        targetAccount: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
        billTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // 格式化结果
    const formattedBills = bills.map((bill) => ({
      ...bill,
      tags: bill.billTags.map((tagLink) => tagLink.tag),
    }));

    return {
      items: formattedBills,
      meta: {
        page: queryBillDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 根据ID查询账单
   * @param id 账单ID
   * @param userId 用户ID
   * @returns 账单详情
   */
  async findOne(id: number, userId: number) {
    const bill = await this.prisma.bill.findFirst({
      where: { 
        id,
        userId
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: {
              select: {
                name: true,
              },
            },
          },
        },
        targetAccount: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: {
              select: {
                name: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        billTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException(`ID为${id}的账单不存在`);
    }

    // 格式化结果
    return {
      ...bill,
      tags: bill.billTags.map((tagLink) => tagLink.tag),
      tagIds: bill.billTags.map((tagLink) => tagLink.tag.id),
    };
  }
}