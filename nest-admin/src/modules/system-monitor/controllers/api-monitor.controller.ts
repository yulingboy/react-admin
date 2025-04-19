import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiMonitorService } from '../modules/api-monitor/api-monitor.service';
import { ApiMonitorQueryDto } from '../dto/system-monitor.dto';

@Controller('system-monitor/api')
export class ApiMonitorController {
  constructor(
    private readonly apiMonitorService: ApiMonitorService,
  ) {}

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
  async getApiRealtimeData() {
    return this.apiMonitorService.getApiRealtimeData();
  }
  
  /**
   * 获取API性能指标
   */
  @Get('performance')
  async getApiPerformance() {
    return this.apiMonitorService.getApiPerformance();
  }

  /**
   * 生成测试API监控数据
   * 用于初始化或测试阶段
   */
  @Post('generate-test-data')
  async generateTestData() {
    return this.apiMonitorService.generateTestData();
  }
}