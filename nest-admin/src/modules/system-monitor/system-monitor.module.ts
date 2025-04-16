import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { SystemMonitorController } from './controllers/system-monitor.controller';
import { SystemResourceService } from './services/system-resource.service';
import { ApiMonitorService } from './services/api-monitor.service';
import { LogStatsService } from './services/log-stats.service';
import { ApiMonitorInterceptor } from './interceptors/api-monitor.interceptor';

import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // 引入定时任务模块，用于定期收集系统资源信息
  ],
  controllers: [SystemMonitorController],
  providers: [
    SystemResourceService,
    ApiMonitorService,
    LogStatsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMonitorInterceptor,
    },
  ],
  exports: [
    SystemResourceService,
    ApiMonitorService,
    LogStatsService,
  ],
})
export class SystemMonitorModule {}