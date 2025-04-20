// 系统资源使用情况
export interface SystemResource {
  id?: number;
  cpuUsage: number; // CPU使用率
  memUsage: number; // 内存使用率
  diskUsage: number; // 磁盘使用率
  uptime: number; // 系统运行时间(秒)
  timestamp: string; // 记录时间
}

// 实时系统资源信息
export interface SystemResourceRealtime extends SystemResource {
  systemInfo: {
    hostname: string;
    platform: string;
    arch: string;
    release: string;
    totalMemory: number;
    freeMemory: number;
    cpus: number;
    loadavg: number[];
    networkInterfaces: any;
    usedMemory?: number;
    cpuModel?: string;
    systemModel?: string;
    diskSize?: number;
    diskFree?: number;
    diskUsed?: number;
  };
}

// 兼容现有组件的类型
export interface SystemResourceInfo extends SystemResourceRealtime {
  cpuCores?: number;
  memoryUsed?: number;
  totalMemory?: number;
  diskFree?: number;
  loadAvg?: number[];
}

// API监控记录
export interface ApiMonitor {
  id?: number;
  path: string; // API路径
  method: string; // 请求方法
  statusCode: number; // 状态码
  responseTime: number; // 响应时间(ms)
  requestCount: number; // 请求计数
  errorCount: number; // 错误计数
  date: string; // 日期(按天统计)
}

// 实时API监控数据
export interface RealtimeApiData {
  recentCalls: ApiMonitor[];
  statusCodeDistribution: {
    statusCode: number;
    _sum: {
      requestCount: number;
    };
  }[];
  slowestApis: {
    path: string;
    method: string;
    responseTime: number;
    requestCount: number;
  }[];
  timestamp: string;
}

// API统计数据
export interface ApiStatistics {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
  topPaths: {
    key: string;
    path: string;
    count: number;
  }[];
  topErrorPaths: {
    key?: string; // 可选，兼容后端可能返回或不返回key的情况
    path: string;
    method: string;
    errorCount: number;
    requestCount: number;
    errorRate: number;
  }[];
}

// API性能指标
export interface ApiPerformanceMetrics {
  performanceTrends: {
    date: string;
    avgResponseTime: number;
    requestCount: number;
    errorCount: number;
    errorRate: number;
  }[];
  apiPerformance: {
    key?: string; // 可选，兼容后端可能返回或不返回key的情况
    path: string;
    method: string;
    responseTime: number;
    requestCount: number;
    errorCount?: number; // 可选，增强兼容性
    errorRate?: number; // 可选，增强兼容性
  }[];
}

// 日志统计
export interface LogStat {
  id?: number;
  level: string; // 日志级别: error, warn, info
  count: number; // 计数
  date: string; // 日期(按天统计)
}

// 日志分析结果
export interface LogAnalysis {
  filename: string;
  date: string;
  totalLines: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  timestamp?: string;
}

// 日志趋势数据
export interface LogTrend {
  date: string;
  ERROR: number;
  WARN: number;
  INFO: number;
}

// 日志级别分布
export interface LogDistribution {
  level: string;
  count: number;
}

// 错误日志详情
export interface ErrorLog {
  timestamp: string;
  context?: string;
  message: string;
  level: string;
}

// 日志统计当日概览数据
export interface LogStatDaily {
  date: string;
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  errorRate: number;
}

// 日志统计概览数据
export interface LogStatsOverview {
  analysis: LogAnalysis;
  todayStats: LogStatDaily;
  trends: LogTrend[];
  distribution: LogDistribution[];
  updatedAt: string;
  error?: string;
}

// 系统监控概览
export interface SystemMonitorOverview {
  resources: SystemResourceRealtime;
  apiStats: ApiStatistics;
  logTrends: LogTrend[];
}

// 系统健康状态
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  checks: {
    cpu: { status: 'healthy' | 'warning' | 'critical' };
    memory: { status: 'healthy' | 'warning' | 'critical' };
    api: { status: 'healthy' | 'warning' | 'critical' };
    logs: { status: 'healthy' | 'warning' | 'critical' };
  };
}

// 查询参数
export interface SystemResourcesQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface ApiMonitorQueryParams {
  startDate?: string;
  endDate?: string;
  path?: string;
  method?: string;
  limit?: number;
}

export interface LogStatsQueryParams {
  startDate?: string;
  endDate?: string;
  level?: string;
}
