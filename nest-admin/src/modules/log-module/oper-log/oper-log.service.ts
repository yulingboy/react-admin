import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateOperLogDto, QueryOperLogDto } from './dto';
import { Prisma } from '@prisma/client';

/**
 * 操作日志服务
 */
@Injectable()
export class OperLogService {
  private readonly logger = new Logger(OperLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建操作日志
   * @param createOperLogDto 操作日志数据
   */
  async create(createOperLogDto: CreateOperLogDto) {
    try {
      return await this.prisma.operLog.create({
        data: createOperLogDto,
      });
    } catch (error) {
      this.logger.error(`创建操作日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 分页查询操作日志
   * @param queryDto 查询条件
   */
  async findAll(queryDto: QueryOperLogDto) {
    const { current = 1, pageSize = 10, title, operName, businessType, status, startTime, endTime } = queryDto;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.OperLogWhereInput = {};
    
    if (title) {
      where.title = { contains: title };
    }
    
    if (operName) {
      where.operName = { contains: operName };
    }
    
    if (businessType) {
      where.businessType = businessType;
    }
    
    if (status) {
      where.status = status;
    }
    
    // 处理时间范围查询
    if (startTime || endTime) {
      where.operTime = {};
      
      if (startTime) {
        where.operTime.gte = new Date(startTime);
      }
      
      if (endTime) {
        where.operTime.lte = new Date(endTime);
      }
    }

    try {
      // 查询总数
      const total = await this.prisma.operLog.count({ where });
      
      // 查询数据
      const list = await this.prisma.operLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { operTime: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });

      return {
        list,
        pagination: {
          current: current,
          pageSize,
          total
        }
      };
    } catch (error) {
      this.logger.error(`查询操作日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清空操作日志
   */
  async clear() {
    try {
      return await this.prisma.operLog.deleteMany({});
    } catch (error) {
      this.logger.error(`清空操作日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量删除操作日志
   * @param ids 日志ID数组
   */
  async batchDelete(ids: number[]) {
    try {
      return await this.prisma.operLog.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
    } catch (error) {
      this.logger.error(`批量删除操作日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询单条操作日志
   * @param id 日志ID
   */
  async findOne(id: number) {
    try {
      return await this.prisma.operLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      this.logger.error(`查询单条操作日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}