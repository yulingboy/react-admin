import { Controller, Get, Query } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { ApiMonitorQueryDto } from '../../dto/system-monitor.dto';

@Controller('system-monitor/api')
export class ApiMonitorController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  /**
   * 获取API监控数据
   */
  @Get()
  async getApiMonitorData(@Query() query: ApiMonitorQueryDto) {
    return this.apiMonitorService.getApiMonitorData(query);
  }

  /**
   * 获取API统计数据
   */
  @Get('statistics')
  async getApiStatistics(@Query('days') days: number = 7) {
    return this.apiMonitorService.getApiStatistics(days);
  }

  /**
   * 获取实时API监控数据
   */
  @Get('realtime')
  async getApiMonitorRealtime() {
    // 获取最近一小时的API调用数据
    return this.apiMonitorService.getRealtimeApiData();
  }

  /**
   * 获取API性能指标
   */
  @Get('performance')
  async getApiPerformance() {
    return this.apiMonitorService.getApiPerformanceMetrics();
  }
}