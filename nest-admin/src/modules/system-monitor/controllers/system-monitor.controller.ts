import { Controller, Get } from '@nestjs/common';
import { SystemMonitorService } from '../system-monitor.service';

@Controller('system-monitor')
export class SystemMonitorController {
  constructor(
    private readonly systemMonitorService: SystemMonitorService,
  ) {}

  /**
   * 获取系统监控概览数据
   * 包括API、资源、日志的综合数据
   */
  @Get('overview')
  async getSystemMonitorOverview() {
    return this.systemMonitorService.getSystemMonitorOverview();
  }

  /**
   * 获取系统健康状态
   */
  @Get('health')
  async getSystemHealth() {
    return this.systemMonitorService.getSystemHealth();
  }
}