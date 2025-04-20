import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { ApiRecordDto } from './dto/api-monitor.dto';
import { startOfDay } from 'date-fns';
import { ApiMonitorCacheService } from './api-monitor-cache.service';

/**
 * API监控队列服务
 * 负责将API监控数据发送到队列中，由队列处理器异步处理
 */
@Injectable()
export class ApiMonitorQueueService {
  private readonly logger = new Logger(ApiMonitorQueueService.name);

  constructor(
    @InjectQueue('api-monitor-queue') private apiMonitorQueue: Queue,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 发送API请求记录到队列
   */
  async addApiRecordToQueue(data: ApiRecordDto): Promise<void> {
    try {
      const { 
        path, method, statusCode, responseTime,
        contentLength, responseSize, userAgent, ip,
        errorMessage, userId
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
      
      // 是否为错误请求
      const isError = statusCode >= 400;
      
      // 首先记录详细信息（如果是错误或随机采样）
      if (statusCode >= 400 || Math.random() < 0.1) { // 10%的请求记录详情
        await this.apiMonitorQueue.add('record-api-detail', data, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true
        });
      }
      
      // 添加到主记录队列
      await this.apiMonitorQueue.add('record-api', {
        ...data,
        isError,
        today: startOfDay(new Date())
      }, {
        attempts: 5, // 允许更多重试次数
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true
      });

      this.logger.debug(`Added ${method} ${path} to API monitor queue`);
    } catch (error) {
      this.logger.error(`Error adding API record to queue: ${error.message}`, error.stack);
    }
  }

  /**
   * 清理队列中的所有任务
   */
  async cleanQueue(): Promise<void> {
    try {
      await this.apiMonitorQueue.clean(0, 'completed');
      await this.apiMonitorQueue.clean(0, 'failed');
      await this.apiMonitorQueue.clean(0, 'delayed');
      await this.apiMonitorQueue.clean(0, 'active');
      await this.apiMonitorQueue.clean(0, 'wait');
      this.logger.log('API monitor queue cleaned');
    } catch (error) {
      this.logger.error(`Error cleaning API monitor queue: ${error.message}`, error.stack);
    }
  }
}