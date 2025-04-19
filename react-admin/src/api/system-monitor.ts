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

// 为了向后兼容，保留原有导出
export const getSystemResourcesRealtime = systemResourceApi.getRealtime;
export const getSystemResourcesHistory = systemResourceApi.getHistory;
export const getApiMonitorData = apiMonitorApi.getData;
export const getApiStatistics = apiMonitorApi.getStatistics;
export const getLogStats = logStatsApi.getStats;
export const analyzeRecentLogs = logStatsApi.analyzeRecent;
export const getLogTrends = logStatsApi.getTrends;
export const getSystemMonitorOverview = systemMonitorApi.getOverview;
