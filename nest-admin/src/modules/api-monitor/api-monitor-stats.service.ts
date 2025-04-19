import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { subDays, startOfDay, format } from 'date-fns';

@Injectable()
export class ApiMonitorStatsService {
  private readonly logger = new Logger(ApiMonitorStatsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 获取API统计数据
   * 使用Redis缓存优化性能
   */
  async getApiStatistics(days: number = 7) {
    try {
      // 验证 days 参数的有效性
      let validDays = days;
      if (isNaN(days) || days <= 0 || days > 365) {
        this.logger.warn(`Invalid days parameter: ${days}, using default of 7 days`);
        validDays = 7;
      }

      // 尝试从缓存获取数据
      const cachedData = await this.cacheService.getApiStatisticsCache(validDays);
      if (cachedData) {
        this.logger.debug(`从缓存获取API统计数据，days=${validDays}`);
        return cachedData;
      }

      // 使用更安全的日期计算方式
      const now = new Date();
      const startDate = subDays(now, validDays);
      
      if (isNaN(startDate.getTime())) {
        this.logger.error('Invalid date calculation, using fallback of 7 days');
        // 使用备选方案 - 7天前
        const fallbackDate = subDays(new Date(), 7);
        
        if (isNaN(fallbackDate.getTime())) {
          throw new Error('Unable to create a valid date for query');
        }
        
        const result = await this.getApiStatisticsWithDate(fallbackDate);
        // 缓存结果
        await this.cacheService.cacheApiStatistics(7, result);
        return result;
      }
      
      const result = await this.getApiStatisticsWithDate(startDate);
      // 缓存结果
      await this.cacheService.cacheApiStatistics(validDays, result);
      return result;
    } catch (error) {
      this.logger.error('Error in getApiStatistics:', error);
      // 返回空结果，防止整个API崩溃
      return {
        totalRequests: 0,
        totalErrors: 0,
        errorRate: 0,
        avgResponseTime: 0,
        avgResponseSize: 0,
        topPaths: [],
        topErrorPaths: [],
        uniqueIPs: 0,
        uniqueUserAgents: 0,
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
    
    // 获取平均响应大小
    const avgResponseSize = await this.prisma.apiMonitor.aggregate({
      _avg: {
        responseSize: true,
      },
      where: {
        date: {
          gte: startDate,
        },
        responseSize: {
          not: null,
        },
      },
    });

    // 获取请求量最多的API路径
    const topPaths = await this.prisma.apiMonitor.groupBy({
      by: ['path', 'method'],
      _sum: {
        requestCount: true,
      },
      orderBy: {
        _sum: {
          requestCount: 'desc',
        },
      },
      take: 10,
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
      take: 10,
    });
    
    // 获取唯一IP数量
    const uniqueIPs = await this.prisma.apiMonitorDetail.groupBy({
      by: ['ip'],
      where: {
        createdAt: {
          gte: startDate,
        },
        ip: {
          not: null,
        },
      },
    });
    
    // 获取唯一用户代理数量
    const uniqueUserAgents = await this.prisma.apiMonitorDetail.groupBy({
      by: ['userAgent'],
      where: {
        createdAt: {
          gte: startDate,
        },
        userAgent: {
          not: null,
        },
      },
    });

    // 计算每个API路径的错误率并添加key
    const pathsWithErrorRate = topErrorPaths.map((item, index) => ({
      key: `error-${index}`,
      path: item.path,
      method: item.method,
      count: item.requestCount,
      error: item.errorCount,
      errorRate: item.requestCount > 0 ? (item.errorCount / item.requestCount) * 100 : 0,
    }));

    // 为topPaths添加key
    const pathsWithKey = topPaths.map((item, index) => ({
      key: `path-${index}`,
      path: item.path,
      method: item.method,
      count: item._sum.requestCount || 0,
    }));

    return {
      totalRequests: totalRequests._sum.requestCount || 0,
      totalErrors: totalErrors._sum.errorCount || 0,
      errorRate: totalRequests._sum.requestCount > 0
        ? (totalErrors._sum.errorCount / totalRequests._sum.requestCount) * 100
        : 0,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
      avgResponseSize: avgResponseSize._avg.responseSize || 0,
      topPaths: pathsWithKey,
      topErrorPaths: pathsWithErrorRate,
      uniqueIPs: uniqueIPs.length,
      uniqueUserAgents: uniqueUserAgents.length,
    };
  }
}