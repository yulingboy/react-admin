import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { startOfDay, format } from 'date-fns';
import { ApiRecordDto } from './dto/api-monitor.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * API监控队列处理器
 * 处理所有API监控记录的写入操作，避免并发写入导致的冲突
 */
@Processor('api-monitor-queue')
export class ApiMonitorQueueProcessor {
  private readonly logger = new Logger(ApiMonitorQueueProcessor.name);
  // 最大重试次数
  private readonly MAX_RETRY_COUNT = 3;

  constructor(private prisma: PrismaService) {}

  /**
   * 处理API记录任务
   * 通过队列串行处理，避免并发写入冲突
   * 使用findUnique + update/create处理并发场景下的记录创建/更新
   */
  @Process('record-api')
  async handleRecordApi(job: Job<ApiRecordDto & { isError: boolean; today: Date }>) {
    const { path, method, statusCode, responseTime, contentLength, 
            responseSize, userAgent, ip, userId, isError, today } = job.data;
    
    let retryCount = 0;
    
    while (retryCount <= this.MAX_RETRY_COUNT) {
      try {
        const dateFormatted = format(today, 'yyyy-MM-dd');
        
        // 使用事务处理，以确保操作的原子性
        await this.prisma.$transaction(async (tx) => {
          // 首先尝试查找记录
          const existingRecord = await tx.apiMonitor.findUnique({
            where: {
              path_method_date: {
                path,
                method,
                date: today,
              }
            }
          });
          
          if (existingRecord) {
            // 记录存在，执行更新操作
            await tx.apiMonitor.update({
              where: {
                id: existingRecord.id
              },
              data: {
                requestCount: existingRecord.requestCount + 1,
                errorCount: isError ? existingRecord.errorCount + 1 : existingRecord.errorCount,
                responseTime: responseTime,
                contentLength: contentLength || existingRecord.contentLength,
                responseSize: responseSize || existingRecord.responseSize,
                userAgent: userAgent || existingRecord.userAgent,
                ip: ip || existingRecord.ip,
                statusCode: statusCode
              },
            });
          } else {
            // 记录不存在，执行创建操作
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
        }, {
          // 设置事务隔离级别为可序列化，确保在高并发场景下的数据一致性
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
        
        this.logger.log(`Successfully processed API record for ${method} ${path} on ${dateFormatted}`);
        break; // 操作成功，跳出循环
      } catch (error) {
        retryCount++;
        
        // 判断是否是唯一约束冲突错误
        const isUniqueViolation = 
          error instanceof PrismaClientKnownRequestError && 
          error.code === 'P2002';
        
        if (isUniqueViolation && retryCount <= this.MAX_RETRY_COUNT) {
          // 唯一约束冲突，增加随机延迟后重试
          const delay = Math.floor(Math.random() * 200) + 100; // 100-300ms的随机延迟
          this.logger.warn(`Unique constraint violated, retrying (${retryCount}/${this.MAX_RETRY_COUNT}) after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (retryCount > this.MAX_RETRY_COUNT) {
          this.logger.error(`Failed to process API record after ${this.MAX_RETRY_COUNT} retries`, {
            path,
            method,
            date: format(today, 'yyyy-MM-dd')
          });
        } else {
          this.logger.error(`Failed to process API record: ${error.message}`, error.stack);
        }
        
        // 记录严重错误但不重抛异常，避免队列任务反复失败
        // 我们已经尽力尝试保存数据，如果仍然失败，记录错误后继续处理队列任务
        return;
      }
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