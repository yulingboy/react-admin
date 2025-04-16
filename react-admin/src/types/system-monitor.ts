// 系统资源使用情况
export interface SystemResource {
  id?: number;
  cpuUsage: number;  // CPU使用率
  memUsage: number;  // 内存使用率
  diskUsage: number; // 磁盘使用率
  uptime: number;    // 系统运行时间(秒)
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
  };
}

// API监控记录
export interface ApiMonitor {
  id?: number;
  path: string;        // API路径
  method: string;      // 请求方法
  statusCode: number;  // 状态码
  responseTime: number; // 响应时间(ms)
  requestCount: number; // 请求计数
  errorCount: number;   // 错误计数
  date: string;         // 日期(按天统计)
}

// API统计数据
export interface ApiStatistics {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
  topPaths: {
    path: string;
    _sum: {
      requestCount: number;
    };
  }[];
  topErrorPaths: {
    path: string;
    method: string;
    errorCount: number;
    requestCount: number;
    errorRate: number;
  }[];
}

// 日志统计
export interface LogStat {
  id?: number;
  level: string;    // 日志级别: error, warn, info
  count: number;    // 计数
  date: string;     // 日期(按天统计)
}

// 日志分析结果
export interface LogAnalysis {
  filename: string;
  date: string;
  totalLines: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

// 日志趋势数据
export interface LogTrend {
  date: string;
  ERROR: number;
  WARN: number;
  INFO: number;
}

// 系统监控概览
export interface SystemMonitorOverview {
  resources: SystemResourceRealtime;
  apiStats: ApiStatistics;
  logTrends: LogTrend[];
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