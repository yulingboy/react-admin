import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ApiMonitorQueryDto } from '../../dto/system-monitor.dto';
import { startOfDay, endOfDay, subHours, subDays, format } from 'date-fns';

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
   * 获取API统计数据
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
   * 获取实时API监控数据（最近一小时）
   * 方法名改为与控制器调用一致
   */
  async getApiRealtimeData() {
    try {
      const oneHourAgo = subHours(new Date(), 1);
      
      // 获取最近一小时的API调用分布
      const recentCalls = await this.prisma.apiMonitor.findMany({
        where: {
          date: {
            gte: oneHourAgo,
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 20, // 限制返回的记录数
      });
      
      // 格式化为前端期望的格式
      const formattedRecentCalls = recentCalls.map(call => ({
        id: call.id,
        path: call.path,
        method: call.method,
        statusCode: call.statusCode,
        responseTime: call.responseTime,
        timestamp: call.date.toISOString()
      }));
      
      // 统计各状态码的请求数量
      const statusCodeDistribution = await this.prisma.apiMonitor.groupBy({
        by: ['statusCode'],
        _sum: {
          requestCount: true,
        },
        where: {
          date: {
            gte: oneHourAgo,
          },
        },
      });
      
      // 获取响应时间最长的几个API
      const slowestApis = await this.prisma.apiMonitor.findMany({
        select: {
          path: true,
          method: true,
          responseTime: true,
          requestCount: true,
        },
        where: {
          date: {
            gte: oneHourAgo,
          },
        },
        orderBy: {
          responseTime: 'desc',
        },
        take: 5,
      });

      return {
        recentCalls: formattedRecentCalls,
        statusCodeDistribution,
        slowestApis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getApiRealtimeData:', error);
      return {
        recentCalls: [],
        statusCodeDistribution: [],
        slowestApis: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取API性能指标
   * 方法名改为与控制器调用一致
   */
  async getApiPerformance() {
    try {
      const threeDaysAgo = subHours(new Date(), 72);
      
      // 获取近3天的API性能趋势
      const performanceTrends = await this.prisma.apiMonitor.groupBy({
        by: ['date'],
        _avg: {
          responseTime: true,
        },
        _sum: {
          requestCount: true,
          errorCount: true,
        },
        where: {
          date: {
            gte: threeDaysAgo,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // 计算各时段的错误率
      const trendsWithErrorRate = performanceTrends.map(item => ({
        date: item.date.toISOString(),
        avgResponseTime: item._avg.responseTime || 0,
        requestCount: item._sum.requestCount || 0,
        errorCount: item._sum.errorCount || 0,
        errorRate: item._sum.requestCount > 0 
          ? (item._sum.errorCount / item._sum.requestCount) * 100 
          : 0,
      }));

      // 获取按响应时间排序的API性能列表
      const apiPerformanceList = await this.prisma.apiMonitor.findMany({
        select: {
          path: true,
          method: true,
          responseTime: true,
          requestCount: true,
          errorCount: true,
        },
        where: {
          date: {
            gte: threeDaysAgo,
          },
        },
        orderBy: {
          responseTime: 'desc',
        },
        take: 20,
      });

      // 添加错误率
      const apiPerformanceWithErrorRate = apiPerformanceList.map((api, index) => ({
        key: `perf-${index}`, // 为前端提供唯一key
        path: api.path,
        method: api.method,
        responseTime: api.responseTime,
        count: api.requestCount,
        error: api.errorCount,
        errorRate: api.requestCount > 0 
          ? (api.errorCount / api.requestCount) * 100 
          : 0,
      }));

      return {
        performanceTrends: trendsWithErrorRate,
        apiPerformance: apiPerformanceWithErrorRate,
      };
    } catch (error) {
      console.error('Error in getApiPerformance:', error);
      return {
        performanceTrends: [],
        apiPerformance: [],
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
      take: 10, // 增加返回数量以适应前端需求
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
      take: 10, // 增加返回数量以适应前端需求
    });

    // 计算每个API路径的错误率并添加key
    const pathsWithErrorRate = topErrorPaths.map((item, index) => ({
      key: `error-${index}`, // 为前端提供唯一key
      path: item.path,
      method: item.method,
      count: item.requestCount,
      error: item.errorCount,
      errorRate: item.requestCount > 0 ? (item.errorCount / item.requestCount) * 100 : 0,
    }));

    // 为topPaths添加key
    const pathsWithKey = topPaths.map((item, index) => ({
      key: `path-${index}`, // 为前端提供唯一key
      path: item.path,
      count: item._sum.requestCount || 0,
    }));

    return {
      totalRequests: totalRequests._sum.requestCount || 0,
      totalErrors: totalErrors._sum.errorCount || 0,
      errorRate: totalRequests._sum.requestCount > 0
        ? (totalErrors._sum.errorCount / totalRequests._sum.requestCount) * 100
        : 0,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
      topPaths: pathsWithKey,
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
    try {
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
    } catch (error) {
      // 仅记录错误，不中断请求处理
      console.error('Error recording API request:', error);
    }
  }

  /**
   * 生成测试API监控数据
   * 用于初始化或测试阶段
   */
  async generateTestData() {
    try {
      const today = startOfDay(new Date());
      const apiPaths = [
        '/users',
        '/roles',
        '/auth/login',
        '/dictionaries',
        '/configs',
        '/code-generator/templates',
        '/sql-executor/execute',
        '/api-tester/collections',
        '/db-manager/connections',
      ];
      
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const statusCodes = [200, 201, 400, 401, 403, 404, 500];
      
      // 清除现有测试数据
      await this.prisma.apiMonitor.deleteMany({});
      
      // 生成过去7天的测试数据
      const createdRecords = [];
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        
        // 为每个API路径生成记录
        for (const path of apiPaths) {
          // 为每个API生成不同的HTTP方法记录
          for (const method of methods) {
            // 只为部分组合生成记录，使数据更真实
            if (Math.random() > 0.3) {
              const responseTime = Math.floor(Math.random() * 500) + 10; // 10ms到510ms之间
              const requestCount = Math.floor(Math.random() * 100) + 1; // 1到100之间的请求数
              
              // 大部分是成功的请求，少部分是错误请求
              const statusCode = Math.random() > 0.9 
                ? statusCodes[Math.floor(Math.random() * statusCodes.length)]
                : 200;
              
              // 计算错误请求数量
              const errorCount = statusCode >= 400 
                ? Math.floor(Math.random() * requestCount * 0.2)  // 最多20%的请求出错
                : 0;
              
              // 创建API监控记录
              const record = await this.prisma.apiMonitor.create({
                data: {
                  path,
                  method,
                  statusCode,
                  responseTime,
                  requestCount,
                  errorCount,
                  date,
                },
              });
              
              createdRecords.push(record);
            }
          }
        }
      }
      
      // 生成实时数据 - 最近一小时的记录
      const realtimeRecords = [];
      for (let i = 0; i < 20; i++) {
        const minutesAgo = Math.floor(Math.random() * 60); // 0到59分钟前
        const timestamp = subHours(new Date(), 0); // 当前时间
        timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);
        
        const path = apiPaths[Math.floor(Math.random() * apiPaths.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        const statusCode = Math.random() > 0.9 
          ? statusCodes[Math.floor(Math.random() * statusCodes.length)]
          : 200;
        const responseTime = Math.floor(Math.random() * 500) + 10;
        
        const record = await this.prisma.apiMonitor.create({
          data: {
            path,
            method,
            statusCode,
            responseTime,
            requestCount: 1, // 实时数据单次请求
            errorCount: statusCode >= 400 ? 1 : 0,
            date: timestamp,
          },
        });
        
        realtimeRecords.push(record);
      }
      
      return {
        success: true,
        message: '测试数据生成成功',
        count: createdRecords.length + realtimeRecords.length,
      };
    } catch (error) {
      console.error('生成测试数据失败:', error);
      return { 
        success: false,
        message: '生成测试数据失败',
        error: error.message 
      };
    }
  }
}