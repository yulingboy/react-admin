import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { ApiMonitorService } from './api-monitor.service';
import { ApiMonitorController } from './api-monitor.controller';
import { ApiMonitorInterceptor } from './api-monitor.interceptor';
import { SharedModule } from '@/shared/shared.module';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { ApiMonitorStatsService } from './api-monitor-stats.service';
import { ApiMonitorPerformanceService } from './api-monitor-performance.service';
import { ApiMonitorRealtimeService } from './api-monitor-realtime.service';
import { ApiMonitorAlertsService } from './api-monitor-alerts.service';
import { ApiMonitorExportService } from './api-monitor-export.service';
import { ApiMonitorDataService } from './api-monitor-data.service';
import { ApiMonitorQueueService } from './api-monitor-queue.service';
import { ApiMonitorQueueProcessor } from './api-monitor-queue.processor';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: 'api-monitor-queue',
      defaultJobOptions: {
        attempts: 3,  // 默认重试次数
        removeOnComplete: true,  // 完成后自动删除
        removeOnFail: false,     // 失败后保留记录
        backoff: {
          type: 'exponential', // 指数退避策略
          delay: 1000          // 初始延迟时间
        }
      },
    }),
  ],
  controllers: [ApiMonitorController],
  providers: [
    ApiMonitorService,
    ApiMonitorCacheService,
    ApiMonitorStatsService,
    ApiMonitorPerformanceService,
    ApiMonitorRealtimeService,
    ApiMonitorAlertsService,
    ApiMonitorExportService,
    ApiMonitorDataService,
    ApiMonitorQueueService,
    ApiMonitorQueueProcessor,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMonitorInterceptor,
    },
  ],
  exports: [ApiMonitorService],
})
export class ApiMonitorModule {}