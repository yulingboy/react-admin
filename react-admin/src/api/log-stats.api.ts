import request from '@/utils/http';
import {
  LogStat,
  LogAnalysis,
  LogTrend,
  LogDistribution,
  LogStatsQueryParams,
  LogStatsOverview
} from '@/types/system-monitor';

/**
 * 日志统计相关API
 * 提供系统日志分析、趋势和分布功能
 */
export const logStatsApi = {
  /**
   * 获取日志统计数据
   * @param params 查询参数，可包含开始日期、结束日期、日志级别等
   * @returns 日志统计数据
   */
  getStats: (params: LogStatsQueryParams) => {
    return request.get<LogStat[]>('/api/system-monitor/logs/stats', { params });
  },

  /**
   * 分析最新日志文件
   * @returns 日志分析结果
   */
  analyzeRecent: () => {
    return request.get<LogAnalysis>('/api/system-monitor/logs/analyze');
  },

  /**
   * 获取日志趋势
   * @param days 统计天数（默认7天）
   * @returns 日志趋势数据
   */
  getTrends: (days?: number) => {
    return request.get<LogTrend[]>('/api/system-monitor/logs/trends', { params: { days } });
  },

  /**
   * 获取日志级别分布
   * @returns 日志级别分布数据
   */
  getDistribution: () => {
    return request.get<LogDistribution[]>('/api/system-monitor/logs/distribution');
  },

  /**
   * 获取详细的错误日志信息
   * @param limit 返回的错误日志数量限制（默认10条）
   * @returns 错误日志列表
   */
  getErrorLogs: (limit: number = 10) => {
    return request.get<any[]>('/api/system-monitor/logs/errors', { params: { limit } });
  },
  
  /**
   * 获取日志统计概览数据
   * 整合分析结果、趋势和分布数据，用于实时更新
   * @returns 日志统计概览数据
   */
  getOverview: () => {
    return request.get<LogStatsOverview>('/api/system-monitor/logs/overview');
  }
};

// 便捷函数导出
export const getLogStats = logStatsApi.getStats;
export const analyzeRecentLogs = logStatsApi.analyzeRecent;
export const getLogTrends = logStatsApi.getTrends;
export const getLogDistribution = logStatsApi.getDistribution;
export const getErrorLogs = logStatsApi.getErrorLogs;
export const getLogStatsOverview = logStatsApi.getOverview;