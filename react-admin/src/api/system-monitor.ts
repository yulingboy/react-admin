import request from '@/utils/http'; // 使用默认导出而不是命名导出
import { 
  SystemResourceRealtime,
  SystemResource,
  ApiMonitor, 
  ApiStatistics,
  LogStat,
  LogAnalysis,
  LogTrend,
  SystemMonitorOverview,
  SystemResourcesQueryParams,
  ApiMonitorQueryParams,
  LogStatsQueryParams
} from '@/types/system-monitor';

// 获取实时系统资源使用情况
export const getSystemResourcesRealtime = () => {
  return request.get<SystemResourceRealtime>('/api/system-monitor/resources/realtime');
};

// 获取历史系统资源使用记录
export const getSystemResourcesHistory = (params: SystemResourcesQueryParams) => {
  return request.get<SystemResource[]>('/api/system-monitor/resources/history', { params });
};

// 获取API监控数据
export const getApiMonitorData = (params: ApiMonitorQueryParams) => {
  return request.get<ApiMonitor[]>('/api/system-monitor/api', { params });
};

// 获取API统计数据
export const getApiStatistics = (days?: number) => {
  return request.get<ApiStatistics>('/api/system-monitor/api/statistics', { params: { days } });
};

// 获取日志统计数据
export const getLogStats = (params: LogStatsQueryParams) => {
  return request.get<LogStat[]>('/api/system-monitor/logs/stats', { params });
};

// 分析最新日志文件
export const analyzeRecentLogs = () => {
  return request.get<LogAnalysis>('/api/system-monitor/logs/analyze');
};

// 获取日志趋势
export const getLogTrends = (days?: number) => {
  return request.get<LogTrend[]>('/api/system-monitor/logs/trends', { params: { days } });
};

// 获取系统监控概览数据
export const getSystemMonitorOverview = () => {
  return request.get<SystemMonitorOverview>('/api/system-monitor/overview');
};