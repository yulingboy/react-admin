import request from '@/utils/http';
import {
  SystemResourceRealtime,
  SystemResource,
  ApiMonitor,
  ApiStatistics,
  LogStat,
  LogAnalysis,
  LogTrend,
  LogDistribution,
  ApiPerformanceMetrics,
  RealtimeApiData,
  SystemMonitorOverview,
  SystemHealth,
  SystemResourcesQueryParams,
  ApiMonitorQueryParams,
  LogStatsQueryParams
} from '@/types/system-monitor';

// API监控查询参数接口
export interface ApiMonitorQueryParams {
  startDate?: string;
  endDate?: string;
  path?: string;
  method?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minResponseTime?: number;
  onlyErrors?: boolean;
  userAgent?: string;
  ip?: string;
}

// API监控记录接口
export interface ApiMonitor {
  id: number;
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestCount: number;
  errorCount: number;
  contentLength?: number;
  responseSize?: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
  date: string;
}

// API监控分页响应接口
export interface ApiMonitorResponse {
  data: ApiMonitor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API统计数据接口
export interface ApiStatistics {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
  avgResponseSize: number;
  topPaths: {
    key: string;
    path: string;
    method: string;
    count: number;
  }[];
  topErrorPaths: {
    key: string;
    path: string;
    method: string;
    count: number;
    error: number;
    errorRate: number;
  }[];
  uniqueIPs: number;
  uniqueUserAgents: number;
}

// 实时API数据接口
export interface RealtimeApiData {
  recentCalls: {
    id: number;
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    contentLength: number;
    responseSize: number;
    ip?: string;
    timestamp: string;
    errorMessage?: string;
  }[];
  statusCodeDistribution: {
    statusCode: number;
    count: number;
    category: string;
  }[];
  slowestApis: {
    path: string;
    method: string;
    responseTime: number;
    statusCode: number;
    createdAt: string;
  }[];
  callTrend: {
    time: string;
    count: number;
  }[];
  timestamp: string;
}

// API性能查询参数接口
export interface ApiPerformanceQueryParams {
  days?: number;
  detailed?: boolean;
  paths?: string[];
  format?: 'hourly' | 'daily';
}

// API性能指标接口
export interface ApiPerformanceMetrics {
  performanceTrends: {
    date: string;
    avgResponseTime: number;
    requestCount: number;
    errorCount: number;
    errorRate: number;
  }[];
  apiPerformance: {
    key: string;
    path: string;
    method: string;
    responseTime: number;
    count: number;
    error: number;
    errorRate: number;
    avgContentSize?: number;
    avgResponseSize?: number;
  }[];
  detailedStats?: {
    statusDistribution: {
      statusCode: number;
      count: number;
      category: string;
    }[];
    methodDistribution: {
      method: string;
      count: number;
    }[];
    pathPrefixDistribution: {
      prefix: string;
      count: number;
    }[];
  };
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

// 系统资源监控API
export const systemResourceApi = {
  // 获取实时系统资源使用情况
  getRealtime: () => {
    return request.get<SystemResourceRealtime>('/api/system-monitor/resources/realtime');
  },

  // 获取历史系统资源使用记录
  getHistory: (params: SystemResourcesQueryParams) => {
    return request.get<SystemResource[]>('/api/system-monitor/resources/history', { params });
  },

  // 获取系统资源概览
  getOverview: () => {
    return request.get<SystemResourceRealtime>('/api/system-monitor/resources/overview');
  }
};

// API监控相关API
export const apiMonitorApi = {
  // 获取API监控数据
  getData: (params: ApiMonitorQueryParams) => {
    return request.get<ApiMonitor[]>('/api/system-monitor/api', { params });
  },

  // 获取API统计数据
  getStatistics: (days?: number) => {
    return request.get<ApiStatistics>('/api/system-monitor/api/statistics', { params: { days } });
  },

  // 获取实时API监控数据
  getRealtime: () => {
    return request.get<RealtimeApiData>('/api/system-monitor/api/realtime');
  },

  // 获取API性能指标
  getPerformance: () => {
    return request.get<ApiPerformanceMetrics>('/api/system-monitor/api/performance');
  }
};

// 日志统计相关API
export const logStatsApi = {
  // 获取日志统计数据
  getStats: (params: LogStatsQueryParams) => {
    return request.get<LogStat[]>('/api/system-monitor/logs/stats', { params });
  },

  // 分析最新日志文件
  analyzeRecent: () => {
    return request.get<LogAnalysis>('/api/system-monitor/logs/analyze');
  },

  // 获取日志趋势
  getTrends: (days?: number) => {
    return request.get<LogTrend[]>('/api/system-monitor/logs/trends', { params: { days } });
  },

  // 获取日志级别分布
  getDistribution: () => {
    return request.get<LogDistribution[]>('/api/system-monitor/logs/distribution');
  },

  // 获取详细的错误日志信息
  getErrorLogs: (limit: number = 10) => {
    return request.get<any[]>('/api/system-monitor/logs/errors', { params: { limit } });
  }
};

// 综合监控API
export const systemMonitorApi = {
  // 获取系统监控概览数据
  getOverview: () => {
    return request.get<SystemMonitorOverview>('/api/system-monitor/overview');
  },

  // 获取系统健康状态
  getHealth: () => {
    return request.get<SystemHealth>('/api/system-monitor/health');
  }
};

/**
 * 获取API监控数据
 * @param params 查询参数
 * @returns API监控数据（分页）
 */
export function getApiMonitorData(params: ApiMonitorQueryParams) {
  return request.get<ApiMonitorResponse>('/api/system-monitor/api', { params });
}

/**
 * 获取API统计数据
 * @param days 统计天数（默认7天）
 * @returns API统计数据
 */
export function getApiStatistics(days?: number) {
  return request.get<ApiStatistics>('/api/system-monitor/api/statistics', { 
    params: days ? { days } : undefined 
  });
}

/**
 * 获取实时API监控数据
 * @returns 实时API监控数据
 */
export function getApiRealtimeData() {
  return request.get<RealtimeApiData>('/api/system-monitor/api/realtime');
}

/**
 * 获取API性能指标
 * @param params 查询参数
 * @returns API性能指标数据
 */
export function getApiPerformance(params?: ApiPerformanceQueryParams) {
  return request.get<ApiPerformanceMetrics>('/api/system-monitor/api/performance', { params });
}

/**
 * 导出API监控数据
 * @param params 导出参数
 * @returns API导出数据
 */
export function exportApiMonitorData(params: ApiExportQueryParams) {
  return request.get('/api/system-monitor/api/export', { 
    params,
    responseType: 'blob' // 使用blob响应类型处理文件下载
  });
}

/**
 * 获取API告警配置
 * @returns API告警配置列表
 */
export function getApiAlertConfigs() {
  return request.get<ApiAlertConfig[]>('/api/system-monitor/api/alerts');
}

/**
 * 保存API告警配置
 * @param config 告警配置
 * @returns 保存后的告警配置
 */
export function saveApiAlertConfig(config: ApiAlertConfig) {
  return request.post<ApiAlertConfig>('/api/system-monitor/api/alerts', config);
}

/**
 * 删除API告警配置
 * @param id 配置ID
 * @returns 操作结果
 */
export function deleteApiAlertConfig(id: number) {
  return request.delete<{success: boolean}>(`/api/system-monitor/api/alerts/${id}`);
}

/**
 * 清理旧的监控数据
 * @param daysToKeep 保留天数（默认30天）
 * @returns 操作结果
 */
export function cleanupOldData(daysToKeep: number = 30) {
  return request.post<{success: boolean}>('/api/system-monitor/api/cleanup', { daysToKeep });
}

/**
 * 生成测试数据
 * @returns 操作结果
 */
export function generateTestData() {
  return request.post<{success: boolean}>('/api/system-monitor/api/generate-test-data');
}

// 为了向后兼容，保留原有导出
export const getSystemResourcesRealtime = systemResourceApi.getRealtime;
export const getSystemResourcesHistory = systemResourceApi.getHistory;
export const getApiMonitorDataLegacy = apiMonitorApi.getData;
export const getApiStatisticsLegacy = apiMonitorApi.getStatistics;
export const getLogStats = logStatsApi.getStats;
export const analyzeRecentLogs = logStatsApi.analyzeRecent;
export const getLogTrends = logStatsApi.getTrends;
export const getSystemMonitorOverview = systemMonitorApi.getOverview;
