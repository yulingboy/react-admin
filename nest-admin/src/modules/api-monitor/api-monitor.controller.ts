import { Controller, Get, Query, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { ApiMonitorQueryDto, ApiPerformanceQueryDto, ApiExportQueryDto, ApiAlertConfigDto } from './dto/api-monitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('system-monitor/api')
export class ApiMonitorController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  /**
   * 获取API监控数据
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getApiMonitorData(@Query() query: ApiMonitorQueryDto) {
    return this.apiMonitorService.getApiMonitorData(query);
  }

  /**
   * 获取API统计数据
   */
  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getApiStatistics(@Query('days') days: number = 7) {
    return this.apiMonitorService.getApiStatistics(days);
  }

  /**
   * 获取实时API监控数据
   */
  @UseGuards(JwtAuthGuard)
  @Get('realtime')
  async getApiMonitorRealtime() {
    return this.apiMonitorService.getApiRealtimeData();
  }

  /**
   * 获取API性能指标
   */
  @UseGuards(JwtAuthGuard)
  @Get('performance')
  async getApiPerformance(@Query() query: ApiPerformanceQueryDto) {
    return this.apiMonitorService.getApiPerformance(query);
  }
  
  /**
   * 导出API监控数据
   */
  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportApiMonitorData(@Query() query: ApiExportQueryDto) {
    return this.apiMonitorService.exportApiMonitorData(query);
  }
  
  /**
   * 获取API告警配置
   */
  @UseGuards(JwtAuthGuard)
  @Get('alerts')
  async getApiAlertConfigs() {
    return this.apiMonitorService.getAlertConfigs();
  }
  
  /**
   * 保存API告警配置
   */
  @UseGuards(JwtAuthGuard)
  @Post('alerts')
  async saveApiAlertConfig(@Body() config: ApiAlertConfigDto) {
    return this.apiMonitorService.saveAlertConfig(config);
  }
  
  /**
   * 删除API告警配置
   */
  @UseGuards(JwtAuthGuard)
  @Delete('alerts/:id')
  async deleteApiAlertConfig(@Param('id') id: number) {
    return this.apiMonitorService.deleteAlertConfig(id);
  }
  
  /**
   * 清理旧的监控数据
   */
  @UseGuards(JwtAuthGuard)
  @Post('cleanup')
  async cleanupOldData(@Body('daysToKeep') daysToKeep: number = 30) {
    return this.apiMonitorService.cleanupOldData(daysToKeep);
  }
  
  /**
   * 生成测试数据
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-test-data')
  async generateTestData() {
    return this.apiMonitorService.generateTestData();
  }
}