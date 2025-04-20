import { Controller, Get, Query } from '@nestjs/common';
import { LogStatsService } from './log-stats.service';
import { LogStatsQueryDto } from './dto/log-stats.dto';

@Controller('system-monitor/logs')
export class LogStatsController {
  constructor(private readonly logStatsService: LogStatsService) {}

  /**
   * 获取日志统计数据
   */
  @Get('stats')
  async getLogStats(@Query() query: LogStatsQueryDto) {
    return this.logStatsService.getLogStats(query);
  }

  /**
   * 分析最新日志文件
   */
  @Get('analyze')
  async analyzeRecentLogs() {
    return this.logStatsService.analyzeRecentLogs();
  }

  /**
   * 获取日志趋势
   */
  @Get('trends')
  async getLogTrends(@Query('days') days: number = 7) {
    return this.logStatsService.getLogTrends(days);
  }
  
  /**
   * 获取日志级别分布
   */
  @Get('distribution')
  async getLogDistribution() {
    return this.logStatsService.getLogDistribution();
  }
  
  /**
   * 获取详细的错误日志信息
   */
  @Get('errors')
  async getErrorLogs(@Query('limit') limit: number = 10) {
    return this.logStatsService.getErrorLogs(limit);
  }

  /**
   * 获取日志统计概览数据
   * 整合分析结果、趋势和分布数据，前端轮询此接口获取实时更新
   */
  @Get('overview')
  async getLogStatsOverview() {
    return this.logStatsService.getLogStatsOverview();
  }
}