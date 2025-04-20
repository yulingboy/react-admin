import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { subHours, subMinutes, format } from 'date-fns';

@Injectable()
export class ApiMonitorRealtimeService {
  private readonly logger = new Logger(ApiMonitorRealtimeService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 获取实时API监控数据（最近一小时）
   * 使用Redis缓存优化，减少数据库查询
   */
  async getApiRealtimeData() {
    try {
      // 尝试从缓存中获取数据
      const cachedData = await this.cacheService.getRealtimeDataCache();
      if (cachedData) {
        this.logger.debug('从缓存获取实时监控数据');
        return cachedData;
      }

      // 如果Redis中已有实时数据，优先使用Redis中的数据
      const recentCalls = await this.cacheService.getRecentApiCalls(50);
      const slowestApis = await this.cacheService.getSlowestApis(10);
      const statusCodeDistribution = await this.cacheService.getStatusCodeDistribution();
      const callTrend = await this.cacheService.getCallTrend();

      // 如果Redis中有足够的数据，直接使用
      if (recentCalls.length > 0 && statusCodeDistribution.length > 0) {
        const result = {
          recentCalls,
          statusCodeDistribution,
          slowestApis,
          callTrend,
          timestamp: new Date().toISOString(),
          source: 'redis-cache'
        };

        // 缓存结果
        await this.cacheService.cacheRealtimeData(result);
        return result;
      }

      // 否则，从数据库获取数据
      const oneHourAgo = subHours(new Date(), 1);
      
      // 获取最近30分钟的详细记录
      const dbRecentCalls = await this.prisma.apiMonitorDetail.findMany({
        where: {
          createdAt: {
            gte: subMinutes(new Date(), 30),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // 增加返回更多最近的请求记录
      });
      
      // 格式化为前端期望的格式
      const formattedRecentCalls = dbRecentCalls.map(call => {
        // 将数据同步到Redis缓存
        this.cacheService.recordApiCall({
          path: call.path,
          method: call.method,
          statusCode: call.statusCode,
          responseTime: call.responseTime,
          contentLength: call.contentLength || 0,
          responseSize: call.responseSize || 0,
          ip: call.ip,
          errorMessage: call.errorMessage || null
        }).catch(err => this.logger.error('缓存API调用数据失败', err));

        return {
          id: call.id,
          path: call.path,
          method: call.method,
          statusCode: call.statusCode,
          responseTime: call.responseTime,
          contentLength: call.contentLength || 0,
          responseSize: call.responseSize || 0,
          ip: call.ip,
          timestamp: call.createdAt.toISOString(),
          errorMessage: call.errorMessage || null,
        };
      });
      
      // 统计各状态码的请求数量
      const dbStatusCodeDistribution = await this.prisma.apiMonitorDetail.groupBy({
        by: ['statusCode'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });
      
      // 转换为前端所需格式
      const formattedStatusDistribution = dbStatusCodeDistribution.map(item => ({
        statusCode: item.statusCode,
        count: item._count.id,
        category: this.getStatusCategory(item.statusCode),
      }));
      
      // 获取最近一小时内响应时间最长的几个API
      const dbSlowestApis = await this.prisma.apiMonitorDetail.findMany({
        select: {
          path: true,
          method: true,
          responseTime: true,
          statusCode: true,
          createdAt: true,
        },
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
        },
        orderBy: {
          responseTime: 'desc',
        },
        take: 10,
      });
      
      // 计算调用量趋势（每5分钟一个数据点）
      const dbCallTrend = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const timePoint = subMinutes(now, i * 5);
        const startTime = subMinutes(timePoint, 5);
        
        const count = await this.prisma.apiMonitorDetail.count({
          where: {
            createdAt: {
              gte: startTime,
              lt: timePoint,
            },
          },
        });
        
        dbCallTrend.push({
          time: format(timePoint, 'HH:mm'),
          count,
        });
      }

      const result = {
        recentCalls: formattedRecentCalls,
        statusCodeDistribution: formattedStatusDistribution,
        slowestApis: dbSlowestApis,
        callTrend: dbCallTrend,
        timestamp: new Date().toISOString(),
        source: 'database'
      };

      // 缓存结果
      await this.cacheService.cacheRealtimeData(result);
      return result;
    } catch (error) {
      this.logger.error('Error in getApiRealtimeData:', error);
      return {
        recentCalls: [],
        statusCodeDistribution: [],
        slowestApis: [],
        callTrend: [],
        timestamp: new Date().toISOString(),
        source: 'error'
      };
    }
  }

  /**
   * 按状态码获取类别
   */
  private getStatusCategory(statusCode: number): string {
    if (statusCode < 200) return 'information';
    if (statusCode < 300) return 'success';
    if (statusCode < 400) return 'redirection';
    if (statusCode < 500) return 'clientError';
    return 'serverError';
  }
}