import React, { useEffect, useState } from 'react';
import { Spin, Alert, Tabs } from 'antd';
import { BarChartOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { logStatsApi } from '@/api/system-monitor';
import { LogStat, LogAnalysis, LogTrend, LogDistribution, ErrorLog } from '@/types/system-monitor';
import dayjs from 'dayjs';

// 导入子组件
import LogStatsHeader from './components/LogStatsHeader';
import LogAnalysisOverview from './components/LogAnalysisOverview';
import LogTrendsChart from './components/LogTrendsChart';
import LogDistributionChart from './components/LogDistributionChart';
import LogStatsTable from './components/LogStatsTable';
import ErrorLogsTable from './components/ErrorLogsTable';
import LogAnalysisChart from './components/LogAnalysisChart';

const LogMonitor: React.FC = () => {
  const [logStats, setLogStats] = useState<LogStat[]>([]);
  const [logTrends, setLogTrends] = useState<LogTrend[]>([]);
  const [logAnalysis, setLogAnalysis] = useState<LogAnalysis | null>(null);
  const [logDistribution, setLogDistribution] = useState<LogDistribution[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzingLogs, setAnalyzingLogs] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(300000); // 默认5分钟
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('1');
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResult, trendsResult, distributionResult, errorsResult] = await Promise.all([
        logStatsApi.getStats({
          startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        }),
        logStatsApi.getTrends(7), // 默认获取过去7天的日志趋势
        logStatsApi.getDistribution(),
        logStatsApi.getErrorLogs(10) // 获取最近10条错误日志
      ]);
      
      setLogStats(statsResult);
      setLogTrends(trendsResult);
      setLogDistribution(distributionResult);
      setErrorLogs(errorsResult);
    } catch (err: any) {
      setError(err.message || '获取日志统计数据失败');
      console.error('Failed to fetch log stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLogs = async () => {
    try {
      setAnalyzingLogs(true);
      const result = await logStatsApi.analyzeRecent();
      setLogAnalysis(result);
    } catch (err: any) {
      console.error('Failed to analyze logs:', err);
    } finally {
      setAnalyzingLogs(false);
      // 重新获取日志统计数据，以确保看到最新的分析结果
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, dateRange]);

  // 刷新间隔变更
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // 渲染日志概览面板
  const renderOverview = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {logAnalysis && <LogAnalysisOverview logAnalysis={logAnalysis} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogTrendsChart logTrends={logTrends} />
          <LogDistributionChart logDistribution={logDistribution} />
        </div>

        <LogStatsTable 
          loading={loading} 
          logStats={logStats} 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    );
  };

  // 渲染错误日志面板
  const renderErrorLogs = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <ErrorLogsTable 
          loading={loading} 
          errorLogs={errorLogs}
          onRefresh={fetchData}
        />
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
            onRefreshData={fetchData}
            loading={loading}
            analyzingLogs={analyzingLogs}
          />
        </div>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <LogStatsHeader
        refreshInterval={refreshInterval}
        onIntervalChange={handleIntervalChange}
        onAnalyzeLogs={handleAnalyzeLogs}
        onRefreshData={fetchData}
        loading={loading}
        analyzingLogs={analyzingLogs}
      />

      <Spin spinning={loading && !logStats.length} className="w-full p-4">
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
                    <WarningOutlined className="mr-1" />
                    错误日志
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