import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

// 导入所有控制器
import { SystemResourceController } from './controllers/system-resource.controller';
import { ApiMonitorController } from './controllers/api-monitor.controller';
import { LogStatsController } from './controllers/log-stats.controller';
import { SystemMonitorController } from './controllers/system-monitor.controller';

// 导入所有服务
import { SystemMonitorService } from './system-monitor.service';
import { SystemResourceService } from './modules/system-resource/system-resource.service';
import { ApiMonitorService } from './modules/api-monitor/api-monitor.service';
import { LogStatsService } from './modules/log-stats/log-stats.service';

// 导入共享模块
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TerminusModule, // 健康检查模块
    HttpModule,     // HTTP请求模块，用于健康检查
  ],
  controllers: [
    SystemResourceController,
    ApiMonitorController,
    LogStatsController,
    SystemMonitorController,
  ],
  providers: [
    SystemMonitorService,
    SystemResourceService,
    ApiMonitorService,
    LogStatsService,
  ],
  exports: [
    SystemResourceService,
    ApiMonitorService,
    LogStatsService,
  ]
})
export class SystemMonitorModule {}