import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Alert, Tabs, Badge } from 'antd';
import { BarChartOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { LogStat, LogAnalysis, LogTrend, LogDistribution, ErrorLog, LogStatsOverview } from '@/types/system-monitor';
import dayjs from 'dayjs';

// 导入子组件
import LogStatsHeader from './components/LogStatsHeader';
import LogAnalysisOverview from './components/LogAnalysisOverview';
import LogTrendsChart from './components/LogTrendsChart';
import LogDistributionChart from './components/LogDistributionChart';
import LogStatsTable from './components/LogStatsTable';
import ErrorLogsTable from './components/ErrorLogsTable';
import LogAnalysisChart from './components/LogAnalysisChart';
import { logStatsApi } from '@/api/log-stats.api';

const LogMonitor: React.FC = () => {
  const [logStats, setLogStats] = useState<LogStat[]>([]);
  const [logTrends, setLogTrends] = useState<LogTrend[]>([]);
  const [logAnalysis, setLogAnalysis] = useState<LogAnalysis | null>(null);
  const [logDistribution, setLogDistribution] = useState<LogDistribution[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [overview, setOverview] = useState<LogStatsOverview | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzingLogs, setAnalyzingLogs] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 默认1分钟
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('1');
  
  // 获取概览数据（高频轮询数据）
  const fetchOverview = useCallback(async () => {
    try {
      const result = await logStatsApi.getOverview();
      setOverview(result);

      // 更新子组件数据
      if (result.analysis) {
        setLogAnalysis(result.analysis);
      }
      if (result.trends && result.trends.length > 0) {
        setLogTrends(result.trends);
      }
      if (result.distribution && result.distribution.length > 0) {
        setLogDistribution(result.distribution);
      }
    } catch (err: any) {
      console.error('获取日志概览数据失败:', err);
    }
  }, []);

  // 获取详细统计数据（低频或手动触发）
  const fetchDetailedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResult, errorsResult] = await Promise.all([
        logStatsApi.getStats({
          startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined
        }),
        logStatsApi.getErrorLogs(10) // 获取最近10条错误日志
      ]);

      setLogStats(statsResult);
      setErrorLogs(errorsResult);
    } catch (err: any) {
      setError(err.message || '获取日志统计数据失败');
      console.error('获取详细日志统计数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // 手动刷新所有数据
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchOverview(),
        fetchDetailedData()
      ]);
    } catch (err: any) {
      setError(err.message || '获取日志统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchDetailedData]);

  const handleAnalyzeLogs = async () => {
    try {
      setAnalyzingLogs(true);
      const result = await logStatsApi.analyzeRecent();
      setLogAnalysis(result);
    } catch (err: any) {
      console.error('日志分析失败:', err);
    } finally {
      setAnalyzingLogs(false);
      // 重新获取统计数据，以确保看到最新的分析结果
      fetchAllData();
    }
  };

  // 初始加载和日期范围变更时获取完整数据
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, dateRange]);

  // 设置高频轮询获取概览数据
  useEffect(() => {
    // 立即执行一次
    fetchOverview();
    
    // 设置轮询
    const overviewInterval = setInterval(() => {
      fetchOverview();
    }, refreshInterval);
    
    // 低频轮询获取详细数据
    const detailedInterval = setInterval(() => {
      fetchDetailedData();
    }, refreshInterval * 5); // 详细数据更新频率是概览数据的1/5
    
    return () => {
      clearInterval(overviewInterval);
      clearInterval(detailedInterval);
    };
  }, [fetchOverview, fetchDetailedData, refreshInterval]);

  // 刷新间隔变更
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // 渲染日志概览面板
  const renderOverview = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {/* 显示今日日志统计卡片 */}
        {overview && overview.todayStats && (
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-4">今日日志统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-gray-500 text-sm">总日志数</div>
                <div className="text-2xl font-bold">{overview.todayStats.totalLogs}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-md">
                <div className="text-gray-500 text-sm">错误日志</div>
                <div className="text-2xl font-bold text-red-600">
                  {overview.todayStats.errorCount}
                  <span className="text-xs ml-2">({overview.todayStats.errorRate.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="text-gray-500 text-sm">警告日志</div>
                <div className="text-2xl font-bold text-yellow-600">{overview.todayStats.warnCount}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-gray-500 text-sm">信息日志</div>
                <div className="text-2xl font-bold text-green-600">{overview.todayStats.infoCount}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-right">
              最后更新: {dayjs(overview.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        )}

        {logAnalysis && <LogAnalysisOverview logAnalysis={logAnalysis} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogTrendsChart logTrends={logTrends} />
          <LogDistributionChart logDistribution={logDistribution} />
        </div>

        <LogStatsTable loading={loading && !overview} logStats={logStats} dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>
    );
  };

  // 渲染错误日志面板
  const renderErrorLogs = () => {
    // 如果有新错误日志，在标签上显示徽章
    const hasNewErrors = overview?.todayStats?.errorCount > 0;
    
    return (
      <div className="grid grid-cols-1 gap-6">
        <ErrorLogsTable loading={loading && !errorLogs.length} errorLogs={errorLogs} onRefresh={fetchDetailedData} />
      </div>
    );
  };

  // 渲染日志分析面板
  const renderAnalysis = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <LogAnalysisChart logStats={logStats} />
      </div>
    );
  };

  if (error) {
    return (
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center border-b border-gray-200 pb-4">
          <LogStatsHeader
            refreshInterval={refreshInterval}
            onIntervalChange={handleIntervalChange}
            onAnalyzeLogs={handleAnalyzeLogs}
            onRefreshData={fetchAllData}
            loading={loading}
            analyzingLogs={analyzingLogs}
          />
        </div>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  // 计算错误日志徽章数量
  const errorBadgeCount = overview?.todayStats?.errorCount || 0;

  return (
    <div className="rounded-lg bg-white shadow">
      <LogStatsHeader
        refreshInterval={refreshInterval}
        onIntervalChange={handleIntervalChange}
        onAnalyzeLogs={handleAnalyzeLogs}
        onRefreshData={fetchAllData}
        loading={loading}
        analyzingLogs={analyzingLogs}
      />

      <Spin spinning={loading && !logStats.length && !overview} className="w-full p-4">
        <div className="p-4">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="mt-2"
            items={[
              {
                key: '1',
                label: (
                  <span className="flex items-center">
                    <InfoCircleOutlined className="mr-1" />
                    日志概览
                  </span>
                ),
                children: renderOverview()
              },
              {
                key: '2',
                label: (
                  <span className="flex items-center">
                    <Badge count={errorBadgeCount} size="small" offset={[5, 0]}>
                      <WarningOutlined className="mr-1" />
                      错误日志
                    </Badge>
                  </span>
                ),
                children: renderErrorLogs()
              },
              {
                key: '3',
                label: (
                  <span className="flex items-center">
                    <BarChartOutlined className="mr-1" />
                    日志分析
                  </span>
                ),
                children: renderAnalysis()
              }
            ]}
          />
        </div>
      </Spin>
    </div>
  );
};

export default LogMonitor;
