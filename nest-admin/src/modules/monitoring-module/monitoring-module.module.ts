import { Module } from '@nestjs/common';
import { ApiMonitorModule } from './api-monitor/api-monitor.module';
import { LogStatsModule } from './log-stats/log-stats.module';
import { SystemResourceModule } from './system-resource/system-resource.module';

@Module({
  imports: [ApiMonitorModule, LogStatsModule, SystemResourceModule],
  exports: [ApiMonitorModule, LogStatsModule, SystemResourceModule],
})
export class MonitoringModuleGroup {}