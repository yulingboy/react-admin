import request from '@/utils/http';
import { 
  SystemResourceRealtime,
  SystemResource,
  SystemResourcesQueryParams
} from '@/types/system-monitor';

/**
 * 系统资源监控API
 * 提供系统CPU、内存、磁盘等资源使用情况的查询功能
 */
export const systemResourceApi = {
  /**
   * 获取实时系统资源使用情况
   * @returns 实时系统资源数据，包含CPU、内存、磁盘使用率等
   */
  getRealtime: () => {
    return request.get<SystemResourceRealtime>('/api/system-monitor/resources/realtime');
  },

  /**
   * 获取历史系统资源使用记录
   * @param params 查询参数，可包含开始日期、结束日期、限制数量等
   * @returns 历史系统资源数据列表
   */
  getHistory: (params: SystemResourcesQueryParams) => {
    return request.get<SystemResource[]>('/api/system-monitor/resources/history', { params });
  },

  /**
   * 获取系统资源概览
   * @returns 系统资源概览数据
   */
  getOverview: () => {
    return request.get<SystemResourceRealtime>('/api/system-monitor/resources/overview');
  }
};

// 导出便捷函数，方便直接调用
export const getSystemResourcesRealtime = systemResourceApi.getRealtime;
export const getSystemResourcesHistory = systemResourceApi.getHistory;