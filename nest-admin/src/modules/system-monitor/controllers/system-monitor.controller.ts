import { Controller, Get, Query } from '@nestjs/common';
import { SystemResourceService } from '../services/system-resource.service';
import { ApiMonitorService } from '../services/api-monitor.service';
import { LogStatsService } from '../services/log-stats.service';
import { SystemResourcesQueryDto, ApiMonitorQueryDto, LogStatsQueryDto } from '../dto/system-monitor.dto';

@Controller('system-monitor')
export class SystemMonitorController {
  constructor(
    private readonly systemResourceService: SystemResourceService,
    private readonly apiMonitorService: ApiMonitorService,
    private readonly logStatsService: LogStatsService,
  ) {}

  /**
   * 获取实时系统资源使用情况
   */
  @Get('resources/realtime')
  async getSystemResourcesRealtime() {
    return this.systemResourceService.getSystemResourcesRealtime();
  }

  /**
   * 获取历史系统资源使用记录
   */
  @Get('resources/history')
  async getSystemResourcesHistory(@Query() query: SystemResourcesQueryDto) {
    return this.systemResourceService.getSystemResourcesHistory(query);
  }

  /**
   * 获取API监控数据
   */
  @Get('api')
  async getApiMonitorData(@Query() query: ApiMonitorQueryDto) {
    return this.apiMonitorService.getApiMonitorData(query);
  }

  /**
   * 获取API统计数据
   */
  @Get('api/statistics')
  async getApiStatistics(@Query('days') days: number = 7) {
    return this.apiMonitorService.getApiStatistics(days);
  }

  /**
   * 获取日志统计数据
   */
  @Get('logs/stats')
  async getLogStats(@Query() query: LogStatsQueryDto) {
    return this.logStatsService.getLogStats(query);
  }

  /**
   * 分析最新日志文件
   */
  @Get('logs/analyze')
  async analyzeRecentLogs() {
    return this.logStatsService.analyzeRecentLogs();
  }

  /**
   * 获取日志趋势
   */
  @Get('logs/trends')
  async getLogTrends(@Query('days') days: number = 7) {
    return this.logStatsService.getLogTrends(days);
  }

  /**
   * 获取系统监控概览数据
   */
  @Get('overview')
  async getSystemMonitorOverview() {
    const [resources, apiStats, logTrends] = await Promise.all([
      this.systemResourceService.getSystemResourcesRealtime(),
      this.apiMonitorService.getApiStatistics(7),
      this.logStatsService.getLogTrends(7),
    ]);

    return {
      resources,
      apiStats,
      logTrends,
    };
  }
}