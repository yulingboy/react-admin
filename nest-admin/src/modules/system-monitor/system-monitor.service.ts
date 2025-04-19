import { Injectable } from '@nestjs/common';
import { SystemResourceService } from './modules/system-resource/system-resource.service';
import { ApiMonitorService } from './modules/api-monitor/api-monitor.service';
import { LogStatsService } from './modules/log-stats/log-stats.service';
import { HealthCheckService, HealthCheck, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { HttpHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class SystemMonitorService {
  constructor(
    private readonly systemResourceService: SystemResourceService,
    private readonly apiMonitorService: ApiMonitorService,
    private readonly logStatsService: LogStatsService,
    private readonly health: HealthCheckService,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly httpHealthIndicator: HttpHealthIndicator,
  ) {}

  /**
   * 获取系统监控概览数据
   * 包括系统资源、API监控、日志统计的综合数据
   */
  async getSystemMonitorOverview() {
    // 并行获取三个模块的数据
    const [
      resourceOverview,
      apiStatistics,
      logDistribution,
      errorLogs
    ] = await Promise.all([
      this.systemResourceService.getSystemResourcesOverview(),
      this.apiMonitorService.getApiStatistics(1), // 最近一天的API统计
      this.logStatsService.getLogDistribution(),
      this.logStatsService.getErrorLogs(5) // 最近5条错误日志
    ]);

    // 返回综合数据
    return {
      resourceOverview,
      apiStatistics,
      logDistribution,
      errorLogs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 检查系统健康状态
   */
  @HealthCheck()
  async getSystemHealth() {
    return this.health.check([
      // 检查磁盘空间
      async () => this.diskHealthIndicator.checkStorage('disk', { 
        path: '/', 
        thresholdPercent: 0.9 // 磁盘使用率超过90%则警告
      }),
      
      // 检查内存使用情况
      async () => this.memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024), // 堆内存超过300MB警告
      async () => this.memoryHealthIndicator.checkRSS('memory_rss', 500 * 1024 * 1024),   // RSS超过500MB警告
      
      // 检查关键API是否可访问
      async () => this.httpHealthIndicator.pingCheck('api', 'http://localhost:3000/api/health'),
    ]);
  }
}