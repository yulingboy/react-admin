import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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

@Module({
  imports: [SharedModule],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMonitorInterceptor,
    },
  ],
  exports: [ApiMonitorService],
})
export class ApiMonitorModule {}