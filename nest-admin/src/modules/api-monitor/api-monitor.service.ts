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

      try {
        // 使用事务处理更新，避免并发冲突
        await this.prisma.$transaction(async (tx) => {
          // 先查询是否存在记录
          const existingRecord = await tx.apiMonitor.findUnique({
            where: {
              path_method_date: {
                path,
                method,
                date: today,
              },
            }
          });

          if (existingRecord) {
            // 如果记录存在，计算加权平均响应时间
            const totalRequests = existingRecord.requestCount + 1;
            const weightedAvgResponseTime = Math.round(
              (existingRecord.responseTime * existingRecord.requestCount + responseTime) / totalRequests
            );

            // 更新记录
            await tx.apiMonitor.update({
              where: {
                id: existingRecord.id
              },
              data: {
                requestCount: { increment: 1 },
                // 使用加权平均值作为新的响应时间
                responseTime: weightedAvgResponseTime,
                // 只有当状态码>=400时才增加错误计数
                errorCount: isError ? { increment: 1 } : undefined,
                // 更新内容长度和响应大小 (可选)
                contentLength: contentLength || existingRecord.contentLength,
                responseSize: responseSize || existingRecord.responseSize,
                // 更新用户代理和IP (可选)
                userAgent: userAgent || existingRecord.userAgent,
                ip: ip || existingRecord.ip,
                // 更新状态码，保留最近一次的状态码
                statusCode: statusCode,
              }
            });
          } else {
            // 创建新记录
            await tx.apiMonitor.create({
              data: {
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
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // 处理已知的Prisma错误，例如唯一约束冲突
          this.logger.warn(`Prisma error in recordApiRequest: ${error.code} - ${error.message}`);
          
          // 对于并发冲突，尝试重试一次
          if (error.code === 'P2002') {
            this.logger.warn('Unique constraint error detected, retrying with a delay...');
            // 添加随机延迟以避免冲突
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            
            // 获取当前记录
            const existingRecord = await this.prisma.apiMonitor.findUnique({
              where: {
                path_method_date: {
                  path,
                  method,
                  date: today,
                }
              }
            });
            
            if (existingRecord) {
              // 直接更新请求计数和错误计数
              await this.prisma.apiMonitor.update({
                where: { id: existingRecord.id },
                data: {
                  requestCount: { increment: 1 },
                  errorCount: isError ? { increment: 1 } : undefined,
                }
              });
            }
          }
        } else {
          // 重新抛出其他类型的错误
          throw error;
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