import request from '@/utils/http';
import { SystemHealth, SystemMonitorOverview } from '@/common/types/system-monitor';

// 重新导出拆分后的API模块，方便使用方统一导入
export * from './system-resource.api';
export * from './api-monitor.api';
export * from './log-stats.api';

/**
 * 综合系统监控API
 * 提供系统整体监控概览和健康状态
 */
export const systemMonitorApi = {
  /**
   * 获取系统监控概览数据
   * @returns 系统监控综合概览数据
   */
  getOverview: () => {
    return request.get<SystemMonitorOverview>('/api/system-monitor/overview');
  },

  /**
   * 获取系统健康状态
   * @returns 系统健康状态信息
   */
  getHealth: () => {
    return request.get<SystemHealth>('/api/system-monitor/health');
  }
};

// 便捷函数导出
export const getSystemMonitorOverview = systemMonitorApi.getOverview;
export const getSystemHealth = systemMonitorApi.getHealth;
