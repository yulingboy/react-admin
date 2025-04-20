import request from '@/utils/http';
import {
  ApiMonitor,
  ApiStatistics,
  RealtimeApiData,
  ApiPerformanceMetrics,
  ApiMonitorQueryParams as BaseApiMonitorQueryParams
} from '@/common/types/system-monitor';

// API监控查询参数接口（扩展自types中的基础定义）
export interface ApiMonitorQueryParams extends BaseApiMonitorQueryParams {
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minResponseTime?: number;
  onlyErrors?: boolean;
  userAgent?: string;
  ip?: string;
}

// API监控记录接口（扩展自types中的基础定义）
export interface ApiMonitorRecord extends ApiMonitor {
  contentLength?: number;
  responseSize?: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
}

// API监控分页响应接口
export interface ApiMonitorResponse {
  data: ApiMonitorRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API性能查询参数接口
export interface ApiPerformanceQueryParams {
  days?: number;
  detailed?: boolean;
  paths?: string[];
  format?: 'hourly' | 'daily';
}

// API导出查询参数接口
export interface ApiExportQueryParams {
  startDate?: string;
  endDate?: string;
  format?: 'csv' | 'json' | 'excel';
  includeDetails?: boolean;
}

// API告警配置接口
export interface ApiAlertConfig {
  id?: number;
  path?: string;
  responseTimeThreshold: number;
  errorRateThreshold: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API监控相关API
 * 提供API请求监控、性能分析和统计功能
 */
export const apiMonitorApi = {
  /**
   * 获取API监控数据
   * @param params 查询参数
   * @returns API监控数据
   */
  getData: (params: ApiMonitorQueryParams) => {
    return request.get<ApiMonitorResponse>('/api/system-monitor/api', { params });
  },

  /**
   * 获取API统计数据
   * @param days 统计天数（默认7天）
   * @returns API统计数据
   */
  getStatistics: (days?: number) => {
    return request.get<ApiStatistics>('/api/system-monitor/api/statistics', { 
      params: days ? { days } : undefined 
    });
  },

  /**
   * 获取实时API监控数据
   * @returns 实时API监控数据
   */
  getRealtime: () => {
    return request.get<RealtimeApiData>('/api/system-monitor/api/realtime');
  },

  /**
   * 获取API性能指标
   * @param params 查询参数
   * @returns API性能指标数据
   */
  getPerformance: (params?: ApiPerformanceQueryParams) => {
    return request.get<ApiPerformanceMetrics>('/api/system-monitor/api/performance', { params });
  },

  /**
   * 导出API监控数据
   * @param params 导出参数
   * @returns API导出数据
   */
  exportData: (params: ApiExportQueryParams) => {
    return request.get('/api/system-monitor/api/export', { 
      params,
      responseType: 'blob' // 使用blob响应类型处理文件下载
    });
  },

  /**
   * 获取API告警配置
   * @returns API告警配置列表
   */
  getAlertConfigs: () => {
    return request.get<ApiAlertConfig[]>('/api/system-monitor/api/alerts');
  },

  /**
   * 保存API告警配置
   * @param config 告警配置
   * @returns 保存后的告警配置
   */
  saveAlertConfig: (config: ApiAlertConfig) => {
    return request.post<ApiAlertConfig>('/api/system-monitor/api/alerts', config);
  },

  /**
   * 删除API告警配置
   * @param id 配置ID
   * @returns 操作结果
   */
  deleteAlertConfig: (id: number) => {
    return request.delete<{success: boolean}>(`/api/system-monitor/api/alerts/${id}`);
  },

  /**
   * 清理旧的监控数据
   * @param daysToKeep 保留天数（默认30天）
   * @returns 操作结果
   */
  cleanupOldData: (daysToKeep: number = 30) => {
    return request.post<{success: boolean}>('/api/system-monitor/api/cleanup', { daysToKeep });
  },

  /**
   * 生成测试数据
   * @returns 操作结果
   */
  generateTestData: () => {
    return request.post<{success: boolean}>('/api/system-monitor/api/generate-test-data');
  }
};

// 便捷函数导出
export const getApiMonitorData = apiMonitorApi.getData;
export const getApiStatistics = apiMonitorApi.getStatistics;
export const getApiRealtimeData = apiMonitorApi.getRealtime;
export const getApiPerformance = apiMonitorApi.getPerformance;
export const exportApiMonitorData = apiMonitorApi.exportData;
export const getApiAlertConfigs = apiMonitorApi.getAlertConfigs;
export const saveApiAlertConfig = apiMonitorApi.saveAlertConfig;
export const deleteApiAlertConfig = apiMonitorApi.deleteAlertConfig;
export const cleanupOldData = apiMonitorApi.cleanupOldData;
export const generateTestData = apiMonitorApi.generateTestData;