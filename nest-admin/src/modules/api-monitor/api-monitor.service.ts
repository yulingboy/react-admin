import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { startOfDay, endOfDay } from 'date-fns';
import { ApiMonitorQueryDto, ApiRecordDto } from './dto/api-monitor.dto';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { ApiMonitorStatsService } from './api-monitor-stats.service';
import { ApiMonitorPerformanceService } from './api-monitor-performance.service';
import { ApiMonitorRealtimeService } from './api-monitor-realtime.service';
import { ApiMonitorAlertsService } from './api-monitor-alerts.service';
import { ApiMonitorExportService } from './api-monitor-export.service';
import { ApiMonitorDataService } from './api-monitor-data.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApiMonitorService {
  private readonly logger = new Logger(ApiMonitorService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService,
    private statsService: ApiMonitorStatsService,
    private performanceService: ApiMonitorPerformanceService,
    private realtimeService: ApiMonitorRealtimeService,
    private alertsService: ApiMonitorAlertsService,
    private exportService: ApiMonitorExportService,
    private dataService: ApiMonitorDataService
  ) {}

  /**
   * 获取API监控数据
   */
  async getApiMonitorData(query: ApiMonitorQueryDto) {
    const { 
      startDate, endDate, path, method, limit = 20, page = 0, 
      sortBy = 'date', sortOrder = 'desc', minResponseTime,
      onlyErrors, userAgent, ip
    } = query;
    
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
    
    if (minResponseTime) {
      where.responseTime = {
        gte: minResponseTime,
      };
    }
    
    if (onlyErrors) {
      where.errorCount = {
        gt: 0,
      };
    }
    
    if (userAgent) {
      where.userAgent = {
        contains: userAgent,
      };
    }
    
    if (ip) {
      where.ip = {
        contains: ip,
      };
    }

    // 计算总记录数
    const total = await this.prisma.apiMonitor.count({ where });
    
    // 排序和分页
    const monitorData = await this.prisma.apiMonitor.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: page * limit,
      take: limit,
    });

    return {
      data: monitorData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * 获取API统计数据
   * 委托给统计服务处理
   */
  async getApiStatistics(days: number = 7) {
    return this.statsService.getApiStatistics(days);
  }

  /**
   * 获取实时API监控数据
   * 委托给实时监控服务处理
   */
  async getApiRealtimeData() {
    return this.realtimeService.getApiRealtimeData();
  }

  /**
   * 获取API性能指标
   * 委托给性能监控服务处理
   */
  async getApiPerformance(query: any = {}) {
    return this.performanceService.getApiPerformance(query);
  }

  /**
   * 记录API请求详情
   */
  async recordApiRequestDetail(data: ApiRecordDto) {
    try {
      const { 
        path, method, statusCode, responseTime,
        contentLength, responseSize, userId,
        userAgent, ip, errorMessage
      } = data;
      
      // 创建详细记录
      await this.prisma.apiMonitorDetail.create({
        data: {
          path,
          method,
          statusCode,
          responseTime,
          contentLength,
          responseSize,
          userId,
          userAgent,
          ip,
          errorMessage,
          // 不保存请求和响应体的详细内容，以免数据库过大
        },
      });
    } catch (error) {
      this.logger.error('Error recording API request detail:', error);
    }
  }

  /**
   * 记录API请求到聚合表
   * 同时缓存到Redis以提高实时数据查询性能
   */
  async recordApiRequest(data: ApiRecordDto) {
    try {
      const { 
        path, method, statusCode, responseTime,
        contentLength, responseSize, userId,
        userAgent, ip, errorMessage
      } = data;
      
      // 将数据记录到Redis缓存
      await this.cacheService.recordApiCall({
        path,
        method,
        statusCode,
        responseTime,
        contentLength: contentLength || 0,
        responseSize: responseSize || 0,
        ip,
        userAgent,
        errorMessage,
        userId
      });
      
      // 首先记录详细信息（如果是错误或随机采样）
      if (statusCode >= 400 || Math.random() < 0.1) { // 10%的请求记录详情
        await this.recordApiRequestDetail(data);
      }
      
      const today = startOfDay(new Date());
      
      // 是否为错误请求
      const isError = statusCode >= 400;

      // 采用更安全的upsert操作，减少并发冲突的可能性
      try {
        await this.prisma.apiMonitor.upsert({
          where: {
            path_method_date: {
              path,
              method,
              date: today,
            }
          },
          update: {
            // 更新请求计数
            requestCount: {
              increment: 1
            },
            // 更新错误计数（如果是错误请求）
            errorCount: isError ? {
              increment: 1
            } : undefined,
            // 更新响应时间（使用条件更新避免数据竞争）
            responseTime: {
              set: this.prisma.$raw`(responseTime * requestCount + ${responseTime}) / (requestCount + 1)`
            },
            // 更新其他字段（仅当提供了新值时）
            contentLength: contentLength ? contentLength : undefined,
            responseSize: responseSize ? responseSize : undefined,
            userAgent: userAgent ? userAgent : undefined,
            ip: ip ? ip : undefined,
            // 更新状态码（保留最新状态码）
            statusCode
          },
          create: {
            path,
            method,
            statusCode,
            responseTime,
            contentLength: contentLength || 0,
            responseSize: responseSize || 0,
            requestCount: 1,
            errorCount: isError ? 1 : 0,
            date: today,
            userAgent: userAgent || null,
            ip: ip || null,
            userId: userId || null,
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.warn(`Prisma error in recordApiRequest: ${error.code} - ${error.message}`);
          
          // 对于仍然出现的并发冲突，采用更可靠的重试逻辑
          if (error.code === 'P2002') {
            this.logger.warn('Unique constraint error detected, retrying with exponential backoff...');
            
            // 实现指数退避策略
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                // 增加随机延迟以避免再次冲突
                const backoffTime = 100 * Math.pow(2, attempt) + Math.random() * 100;
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                
                // 直接更新现有记录
                await this.prisma.apiMonitor.updateMany({
                  where: {
                    path,
                    method,
                    date: today
                  },
                  data: {
                    requestCount: { increment: 1 },
                    errorCount: isError ? { increment: 1 } : undefined,
                  }
                });
                
                // 更新成功，跳出重试循环
                this.logger.log(`Successfully updated record after ${attempt + 1} attempts`);
                break;
              } catch (retryError) {
                if (attempt === 2) { // 最后一次尝试
                  this.logger.error(`Failed to update record after multiple attempts: ${retryError.message}`);
                }
              }
            }
          }
        } else {
          // 记录错误但不中断请求处理
          this.logger.error('Unexpected error in recordApiRequest:', error);
        }
      }
      
      // 检查是否需要触发警报
      await this.alertsService.checkAlerts(path, method, responseTime, isError);

      // 清除相关缓存，确保下次获取的是最新数据
      await this.invalidateRealtimeCache();
    } catch (error) {
      // 仅记录错误，不中断请求处理
      this.logger.error('Error recording API request:', error);
    }
  }
  
  /**
   * 获取API警报配置
   * 委托给告警服务处理
   */
  async getAlertConfigs() {
    return this.alertsService.getAlertConfigs();
  }
  
  /**
   * 创建或更新API警报配置
   * 委托给告警服务处理
   */
  async saveAlertConfig(config: any) {
    return this.alertsService.saveAlertConfig(config);
  }
  
  /**
   * 删除API警报配置
   * 委托给告警服务处理
   */
  async deleteAlertConfig(id: number) {
    return this.alertsService.deleteAlertConfig(id);
  }
  
  /**
   * 导出API监控数据
   * 委托给导出服务处理
   */
  async exportApiMonitorData(query: any) {
    return this.exportService.exportApiMonitorData(query);
  }

  /**
   * 生成测试API监控数据
   * 委托给数据服务处理
   */
  async generateTestData() {
    return this.dataService.generateTestData();
  }
  
  /**
   * 清理旧监控数据
   * 委托给数据服务处理
   */
  async cleanupOldData(daysToKeep: number = 30) {
    return this.dataService.cleanupOldData(daysToKeep);
  }

  // ===== 缓存相关方法 =====
  private async invalidateRealtimeCache(): Promise<void> {
    await this.cacheService.invalidateCache('realtime');
  }
}