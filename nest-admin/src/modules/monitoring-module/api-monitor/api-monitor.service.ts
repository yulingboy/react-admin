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
import { ApiMonitorQueueService } from './api-monitor-queue.service';
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
    private dataService: ApiMonitorDataService,
    private queueService: ApiMonitorQueueService
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
   * 此方法已被弃用，由队列处理器直接处理
   * 保留此方法仅作为内部服务方法参考
   * @deprecated 使用队列处理代替
   */
  private async recordApiRequestDetail(data: ApiRecordDto) {
    this.logger.warn('直接调用 recordApiRequestDetail 方法已被弃用，请使用队列服务');
    // 方法内容保留但不再直接使用
  }

  /**
   * 记录API请求
   * 将请求添加到队列中异步处理，避免并发冲突
   */
  async recordApiRequest(data: ApiRecordDto) {
    try {
      // 检查告警（这个操作可以同步执行）
      const isError = data.statusCode >= 400;
      await this.alertsService.checkAlerts(
        data.path, 
        data.method, 
        data.responseTime, 
        isError
      );

      // 将记录请求添加到队列
      await this.queueService.addApiRecordToQueue(data);
      
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