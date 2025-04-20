import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { ApiPerformanceQueryDto } from './dto/api-monitor.dto';
import { subDays, format } from 'date-fns';
import * as crypto from 'crypto';

@Injectable()
export class ApiMonitorPerformanceService {
  private readonly logger = new Logger(ApiMonitorPerformanceService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 获取API性能指标
   * 使用Redis缓存优化性能
   */
  async getApiPerformance(query: ApiPerformanceQueryDto = {}) {
    try {
      // 生成查询的哈希作为缓存键
      const queryHash = crypto
        .createHash('md5')
        .update(JSON.stringify(query))
        .digest('hex');

      // 尝试从缓存获取数据
      const cachedData = await this.cacheService.getApiPerformanceCache(queryHash);
      if (cachedData) {
        this.logger.debug(`从缓存获取API性能数据，hash=${queryHash}`);
        return cachedData;
      }

      const { days = 3, detailed = false, paths = [], format = 'daily' } = query;
      const startDate = subDays(new Date(), days);
      
      // 构建查询条件
      const where: any = {
        date: {
          gte: startDate,
        },
      };
      
      // 如果指定了特定路径，只查询这些路径
      if (paths && paths.length > 0) {
        where.path = {
          in: paths,
        };
      }
      
      // 获取API性能趋势
      let performanceTrends;
      if (format === 'hourly') {
        // 按小时聚合 - 对于详细视图
        performanceTrends = await this.getHourlyPerformanceTrends(startDate, where);
      } else {
        // 按天聚合 - 默认视图
        performanceTrends = await this.getDailyPerformanceTrends(startDate, where);
      }

      // 获取按响应时间排序的API性能列表
      const apiPerformanceList = await this.prisma.apiMonitor.findMany({
        select: {
          path: true,
          method: true,
          responseTime: true,
          requestCount: true,
          errorCount: true,
          contentLength: true,
          responseSize: true,
        },
        where,
        orderBy: {
          responseTime: 'desc',
        },
        take: detailed ? 50 : 20,
      });

      // 添加错误率
      const apiPerformanceWithErrorRate = apiPerformanceList.map((api, index) => ({
        key: `perf-${index}`,
        path: api.path,
        method: api.method,
        responseTime: api.responseTime,
        count: api.requestCount,
        error: api.errorCount,
        errorRate: api.requestCount > 0 
          ? (api.errorCount / api.requestCount) * 100 
          : 0,
        avgContentSize: api.contentLength !== null ? Math.round(api.contentLength / (api.requestCount || 1)) : 0,
        avgResponseSize: api.responseSize !== null ? Math.round(api.responseSize / (api.requestCount || 1)) : 0,
      }));
      
      // 如果请求了详细信息，添加更多统计数据
      let detailedStats = null;
      if (detailed) {
        detailedStats = await this.getDetailedPerformanceStats(startDate);
      }

      const result = {
        performanceTrends,
        apiPerformance: apiPerformanceWithErrorRate,
        ...(detailed ? { detailedStats } : {}),
      };

      // 缓存结果
      await this.cacheService.cacheApiPerformance(queryHash, result);
      return result;
    } catch (error) {
      this.logger.error('Error in getApiPerformance:', error);
      return {
        performanceTrends: [],
        apiPerformance: [],
      };
    }
  }

  /**
   * 获取每小时性能趋势
   */
  private async getHourlyPerformanceTrends(startDate: Date, where: any) {
    // 这个实现可能需要根据具体数据库支持的函数调整
    // 这里使用按小时分组的近似方法
    const hourlyData = await this.prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d %H:00:00') as hourGroup,
        AVG(responseTime) as avgResponseTime,
        SUM(requestCount) as totalRequests,
        SUM(errorCount) as totalErrors
      FROM api_monitors
      WHERE date >= ${startDate}
      GROUP BY hourGroup
      ORDER BY hourGroup ASC
    `;
    
    // 将结果转换为前端所需的格式
    return Array.isArray(hourlyData) ? hourlyData.map((item: any) => ({
      date: item.hourGroup.toString(),
      avgResponseTime: Number(item.avgResponseTime) || 0,
      requestCount: Number(item.totalRequests) || 0,
      errorCount: Number(item.totalErrors) || 0,
      errorRate: item.totalRequests > 0 
        ? (item.totalErrors / item.totalRequests) * 100 
        : 0,
    })) : [];
  }
  
  /**
   * 获取每天性能趋势
   */
  private async getDailyPerformanceTrends(startDate: Date, where: any) {
    // 按天分组
    const dailyData = await this.prisma.apiMonitor.groupBy({
      by: ['date'],
      _avg: {
        responseTime: true,
      },
      _sum: {
        requestCount: true,
        errorCount: true,
      },
      where,
      orderBy: {
        date: 'asc',
      },
    });
    
    return dailyData.map(item => ({
      date: format(item.date, 'yyyy-MM-dd'),
      avgResponseTime: item._avg.responseTime || 0,
      requestCount: item._sum.requestCount || 0,
      errorCount: item._sum.errorCount || 0,
      errorRate: item._sum.requestCount > 0 
        ? (item._sum.errorCount / item._sum.requestCount) * 100 
        : 0,
    }));
  }
  
  /**
   * 获取详细性能统计
   */
  private async getDetailedPerformanceStats(startDate: Date) {
    // 获取状态码分布
    const statusDistribution = await this.prisma.apiMonitor.groupBy({
      by: ['statusCode'],
      _sum: {
        requestCount: true,
      },
      where: {
        date: {
          gte: startDate,
        }
      },
    });
    
    // 获取HTTP方法分布
    const methodDistribution = await this.prisma.apiMonitor.groupBy({
      by: ['method'],
      _sum: {
        requestCount: true,
      },
      where: {
        date: {
          gte: startDate,
        }
      },
    });
    
    // 按路径前缀分组（例如/api/users -> /api）
    const pathPrefixDistribution = await this.prisma.$queryRaw`
      SELECT 
        SUBSTRING_INDEX(path, '/', 2) as pathPrefix, 
        SUM(requestCount) as count
      FROM api_monitors
      WHERE date >= ${startDate}
      GROUP BY pathPrefix
      ORDER BY count DESC
      LIMIT 10
    `;
    
    return {
      statusDistribution: statusDistribution.map(item => ({
        statusCode: item.statusCode,
        count: item._sum.requestCount || 0,
        category: this.getStatusCategory(item.statusCode),
      })),
      methodDistribution: methodDistribution.map(item => ({
        method: item.method,
        count: item._sum.requestCount || 0,
      })),
      pathPrefixDistribution: Array.isArray(pathPrefixDistribution) 
        ? pathPrefixDistribution.map((item: any) => ({
            prefix: item.pathPrefix,
            count: Number(item.count),
          })) 
        : [],
    };
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