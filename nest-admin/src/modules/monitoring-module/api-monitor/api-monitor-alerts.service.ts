import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ApiMonitorCacheService } from './api-monitor-cache.service';
import { ApiAlertConfigDto } from './dto/api-monitor.dto';

@Injectable()
export class ApiMonitorAlertsService {
  private readonly logger = new Logger(ApiMonitorAlertsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: ApiMonitorCacheService
  ) {}

  /**
   * 获取API警报配置
   */
  async getAlertConfigs() {
    return this.prisma.apiAlertConfig.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
  
  /**
   * 创建或更新API警报配置
   */
  async saveAlertConfig(config: ApiAlertConfigDto) {
    const result = await this.prisma.apiAlertConfig.upsert({
      where: {
        id: config.id || 0,
      },
      update: {
        path: config.path || null,
        responseTimeThreshold: config.responseTimeThreshold,
        errorRateThreshold: config.errorRateThreshold,
        enabled: config.enabled,
      },
      create: {
        path: config.path || null,
        responseTimeThreshold: config.responseTimeThreshold,
        errorRateThreshold: config.errorRateThreshold,
        enabled: config.enabled,
      },
    });

    // 清除相关缓存
    await this.invalidateAlertsCache();
    return result;
  }
  
  /**
   * 删除API警报配置
   */
  async deleteAlertConfig(id: number) {
    const result = await this.prisma.apiAlertConfig.delete({
      where: { id },
    });

    // 清除相关缓存
    await this.invalidateAlertsCache();
    return result;
  }

  /**
   * 检查是否需要触发警报
   */
  async checkAlerts(path: string, method: string, responseTime: number, isError: boolean) {
    try {
      // 查找适用于该路径的警报配置
      const alerts = await this.prisma.apiAlertConfig.findMany({
        where: {
          OR: [
            { path: null }, // 全局规则
            { path }, // 针对特定路径的规则
          ],
          enabled: true,
        },
      });
      
      if (alerts.length === 0) return;
      
      for (const alert of alerts) {
        // 检查响应时间是否超过阈值
        if (responseTime > alert.responseTimeThreshold) {
          this.logger.warn(`API性能警报: ${method} ${path} 响应时间(${responseTime}ms)超过阈值(${alert.responseTimeThreshold}ms)`);
          // 在这里可以添加实际的警报通知逻辑，如发送邮件、钉钉通知等
        }
        
        // 检查错误率逻辑可以在统计API中实现
      }
    } catch (error) {
      this.logger.error('Error checking alerts:', error);
    }
  }

  private async invalidateAlertsCache(): Promise<void> {
    // 清除所有与告警相关的缓存
    await this.cacheService.invalidateCache('alerts');
  }
}