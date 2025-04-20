import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { ApiRecordDto } from './dto/api-monitor.dto';

/**
 * API监控队列处理器
 * 处理所有API监控记录的写入操作，避免并发写入导致的冲突
 */
@Processor('api-monitor-queue')
export class ApiMonitorQueueProcessor {
  private readonly logger = new Logger(ApiMonitorQueueProcessor.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 处理API记录任务
   * 通过队列串行处理，避免并发写入冲突
   * 使用upsert操作处理并发场景下的记录创建/更新
   */
  @Process('record-api')
  async handleRecordApi(job: Job<ApiRecordDto & { isError: boolean; today: Date }>) {
    const { path, method, statusCode, responseTime, contentLength, 
            responseSize, userAgent, ip, userId, isError, today } = job.data;
    
    try {
      // 使用upsert操作，自动处理记录存在和不存在的情况
      await this.prisma.apiMonitor.upsert({
        where: {
          path_method_date: {
            path,
            method,
            date: today,
          }
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
        },
        update: {
          requestCount: { increment: 1 },
          errorCount: isError ? { increment: 1 } : undefined,
          responseTime: responseTime,
          contentLength: contentLength || null,
          responseSize: responseSize || null,
          userAgent: userAgent || null,
          ip: ip || null,
          statusCode
        },
      });

      this.logger.log(`Successfully processed API record for ${method} ${path}`);
    } catch (error) {
      this.logger.error(`Failed to process API record: ${error.message}`, error.stack);
      throw error; // 重新抛出错误，让Bull处理重试
    }
  }

  /**
   * 处理API记录详情任务
   */
  @Process('record-api-detail')
  async handleRecordApiDetail(job: Job<ApiRecordDto>) {
    const { 
      path, method, statusCode, responseTime,
      contentLength, responseSize, userId,
      userAgent, ip, errorMessage
    } = job.data;
    
    try {
      // 创建详细记录，确保错误信息不会太长
      const limitedErrorMessage = errorMessage 
        ? (errorMessage.length > 2000 ? errorMessage.substring(0, 2000) + '...' : errorMessage)
        : null;
        
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
          errorMessage: limitedErrorMessage,
        },
      });

      this.logger.debug(`Successfully recorded API detail for ${method} ${path}`);
    } catch (error) {
      this.logger.error(`Failed to record API detail: ${error.message}`, error.stack);
      throw error; // 重新抛出错误，让Bull处理重试
    }
  }
}