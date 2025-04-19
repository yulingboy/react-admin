import { Controller, Get, Query } from '@nestjs/common';
import { LogStatsService } from '../modules/log-stats/log-stats.service';
import { LogStatsQueryDto } from '../dto/system-monitor.dto';

@Controller('system-monitor/logs')
export class LogStatsController {
  constructor(
    private readonly logStatsService: LogStatsService,
  ) {}

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
}