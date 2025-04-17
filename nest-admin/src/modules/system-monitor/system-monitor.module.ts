import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../shared/prisma/prisma.module';

import { SystemMonitorController } from './controllers/system-monitor.controller';
import { SystemResourceModule } from './modules/system-resource/system-resource.module';
import { ApiMonitorModule } from './modules/api-monitor/api-monitor.module';
import { LogStatsModule } from './modules/log-stats/log-stats.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    SystemResourceModule,
    ApiMonitorModule,
    LogStatsModule
  ],
  controllers: [SystemMonitorController],
  exports: [
    SystemResourceModule,
    ApiMonitorModule,
    LogStatsModule
  ],
})
export class SystemMonitorModule {}