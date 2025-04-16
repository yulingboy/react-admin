import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { ApiMonitorQueryDto } from '../dto/system-monitor.dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ApiMonitorService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取API监控数据
   */
  async getApiMonitorData(query: ApiMonitorQueryDto) {
    const { startDate, endDate, path, method, limit = 20 } = query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(new Date(startDate)),
        lte: endOfDay(new Date(endDate)),
      };
    } else if (startDate) {
      where.date = {
        gte: startOfDay(new Date(startDate)),
      };
    } else if (endDate) {
      where.date = {
        lte: endOfDay(new Date(endDate)),
      };
    }

    if (path) {
      where.path = {
        contains: path,
      };
    }

    if (method) {
      where.method = method;
    }

    const monitorData = await this.prisma.apiMonitor.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { requestCount: 'desc' },
      ],
      take: limit,
    });

    return monitorData;
  }

  /**
   * 获取API总体统计数据
   */
  async getApiStatistics(days: number = 7) {
    try {
      // 使用更安全的日期计算方式
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
      
      if (isNaN(startDate.getTime())) {
        console.error('Invalid date calculation, using fallback of 7 days');
        // 使用备选方案 - 7天前
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() - 7);
        fallbackDate.setHours(0, 0, 0, 0);
        
        if (isNaN(fallbackDate.getTime())) {
          throw new Error('Unable to create a valid date for query');
        }
        
        return this.getApiStatisticsWithDate(fallbackDate);
      }
      
      return this.getApiStatisticsWithDate(startDate);
    } catch (error) {
      console.error('Error in getApiStatistics:', error);
      // 返回空结果，防止整个API崩溃
      return {
        totalRequests: 0,
        totalErrors: 0,
        errorRate: 0,
        avgResponseTime: 0,
        topPaths: [],
        topErrorPaths: [],
      };
    }
  }

  /**
   * 使用指定日期获取API统计数据
   * 将查询逻辑分离，便于错误处理
   */
  private async getApiStatisticsWithDate(startDate: Date) {
    // 获取API请求总量
    const totalRequests = await this.prisma.apiMonitor.aggregate({
      _sum: {
        requestCount: true,
      },
      where: {
        date: {
          gte: startDate,
        },
      },
    });

    // 获取API错误总量
    const totalErrors = await this.prisma.apiMonitor.aggregate({
      _sum: {
        errorCount: true,
      },
      where: {
        date: {
          gte: startDate,
        },
      },
    });

    // 获取平均响应时间
    const avgResponseTime = await this.prisma.apiMonitor.aggregate({
      _avg: {
        responseTime: true,
      },
      where: {
        date: {
          gte: startDate,
        },
      },
    });

    // 获取请求量最多的API路径
    const topPaths = await this.prisma.apiMonitor.groupBy({
      by: ['path'],
      _sum: {
        requestCount: true,
      },
      orderBy: {
        _sum: {
          requestCount: 'desc',
        },
      },
      take: 5,
      where: {
        date: {
          gte: startDate,
        },
      },
    });

    // 获取错误率最高的API路径
    const topErrorPaths = await this.prisma.apiMonitor.findMany({
      select: {
        path: true,
        method: true,
        requestCount: true,
        errorCount: true,
      },
      where: {
        date: {
          gte: startDate,
        },
        errorCount: {
          gt: 0,
        },
      },
      orderBy: [
        {
          errorCount: 'desc',
        },
      ],
      take: 5,
    });

    // 计算每个API路径的错误率
    const pathsWithErrorRate = topErrorPaths.map(item => ({
      path: item.path,
      method: item.method,
      errorCount: item.errorCount,
      requestCount: item.requestCount,
      errorRate: item.requestCount > 0 ? (item.errorCount / item.requestCount) * 100 : 0,
    }));

    return {
      totalRequests: totalRequests._sum.requestCount || 0,
      totalErrors: totalErrors._sum.errorCount || 0,
      errorRate: totalRequests._sum.requestCount > 0
        ? (totalErrors._sum.errorCount / totalRequests._sum.requestCount) * 100
        : 0,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
      topPaths,
      topErrorPaths: pathsWithErrorRate,
    };
  }

  /**
   * 记录API请求
   * 由拦截器调用，记录API请求信息
   */
  async recordApiRequest(data: {
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
  }) {
    const { path, method, statusCode, responseTime } = data;
    const today = startOfDay(new Date());
    
    // 检查是否存在当天该API路径和方法的记录
    const existing = await this.prisma.apiMonitor.findFirst({
      where: {
        path,
        method,
        date: today,
      },
    });

    if (existing) {
      // 更新现有记录
      await this.prisma.apiMonitor.update({
        where: {
          id: existing.id,
        },
        data: {
          requestCount: { increment: 1 },
          responseTime: Math.floor((existing.responseTime * existing.requestCount + responseTime) / (existing.requestCount + 1)),
          errorCount: statusCode >= 400 ? { increment: 1 } : undefined,
        },
      });
    } else {
      // 创建新记录
      await this.prisma.apiMonitor.create({
        data: {
          path,
          method,
          statusCode,
          responseTime,
          requestCount: 1,
          errorCount: statusCode >= 400 ? 1 : 0,
          date: today,
        },
      });
    }
  }
}