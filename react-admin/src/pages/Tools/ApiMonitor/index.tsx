import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import { ApiOutlined, LineChartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiMonitorApi } from '@/api/system-monitor';
import { ApiStatistics, ApiPerformanceMetrics, RealtimeApiData } from '@/types/system-monitor';

// 导入拆分后的子组件
import ApiMonitorHeader from './components/ApiMonitorHeader';
import ApiOverviewPanel from './components/ApiOverviewPanel';
import ApiPerformancePanel from './components/ApiPerformancePanel';
import ApiRealtimePanel from './components/ApiRealtimePanel';

// 为表格定义的类型
interface ApiPathItem {
  key: string;
  path: string;
  method?: string;
  count: number;
  responseTime?: number;
  error?: number;
  errorRate?: number;
}

const ApiMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [realtimeLoading, setRealtimeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 默认1分钟刷新一次

  // 存储各类监控数据
  const [apiStats, setApiStats] = useState<ApiStatistics | null>(null);
  const [apiPerformance, setApiPerformance] = useState<ApiPerformanceMetrics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeApiData | null>(null);
  
  // 从apiStats中提取的表格数据
  const [topPathsData, setTopPathsData] = useState<ApiPathItem[]>([]);
  const [topErrorPathsData, setTopErrorPathsData] = useState<ApiPathItem[]>([]);
  const [apiPerformanceData, setApiPerformanceData] = useState<ApiPathItem[]>([]);

  // 请求统计数据
  const fetchApiStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiMonitorApi.getStatistics();
      setApiStats(data);
      
      // 处理topPaths数据
      if (data.topPaths && Array.isArray(data.topPaths)) {
        const pathsData = data.topPaths.map((item, index) => ({
          key: `path-${index}`,
          path: item.path,
          count: item._sum.requestCount,
        }));
        setTopPathsData(pathsData);
      }
      
      // 处理topErrorPaths数据
      if (data.topErrorPaths && Array.isArray(data.topErrorPaths)) {
        const errorPathsData = data.topErrorPaths.map((item, index) => ({
          key: `error-${index}`,
          path: item.path,
          method: item.method,
          count: item.requestCount,
          error: item.errorCount,
          errorRate: item.errorRate,
        }));
        setTopErrorPathsData(errorPathsData);
      }
    } catch (err) {
      setError('获取API统计数据失败，请稍后重试');
      console.error('获取API统计数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 请求性能数据
  const fetchApiPerformance = async () => {
    try {
      setPerformanceLoading(true);
      const data = await apiMonitorApi.getPerformance();
      setApiPerformance(data);
      
      if (data.apiPerformance && Array.isArray(data.apiPerformance)) {
        const performanceData = data.apiPerformance.map((item, index) => ({
          key: `perf-${index}`,
          path: item.path,
          method: item.method,
          count: item.requestCount,
          responseTime: item.responseTime,
          error: item.errorCount,
          errorRate: item.errorRate
        }));
        setApiPerformanceData(performanceData);
      }
    } catch (err) {
      console.error('获取API性能数据错误:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // 请求实时数据
  const fetchRealtimeData = async () => {
    try {
      setRealtimeLoading(true);
      const data = await apiMonitorApi.getRealtime();
      setRealtimeData(data);
    } catch (err) {
      console.error('获取API实时数据错误:', err);
    } finally {
      setRealtimeLoading(false);
    }
  };

  // 刷新所有数据
  const handleRefresh = () => {
    fetchApiStats();
    fetchApiPerformance();
    fetchRealtimeData();
  };

  // 首次加载和定时刷新
  useEffect(() => {
    handleRefresh();
    
    const timer = setInterval(handleRefresh, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  // 刷新间隔变更
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  if (error) {
    return (
      <div className="rounded-lg bg-white shadow">
        <ApiMonitorHeader
          refreshInterval={refreshInterval}
          onIntervalChange={handleIntervalChange}
          onRefresh={handleRefresh}
          loading={loading || performanceLoading || realtimeLoading}
        />
        <div className="p-4">
          <Alert message="错误" description={error} type="error" showIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <ApiMonitorHeader
        refreshInterval={refreshInterval}
        onIntervalChange={handleIntervalChange}
        onRefresh={handleRefresh}
        loading={loading || performanceLoading || realtimeLoading}
      />

      <div className="p-4">
        <Spin spinning={loading && !apiStats && !apiPerformance && !realtimeData}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="mt-2"
            items={[
              {
                key: '1',
                label: (
                  <span className="flex items-center">
                    <ApiOutlined className="mr-1" />
                    概览
                  </span>
                ),
                children: (
                  <ApiOverviewPanel
                    apiStats={apiStats}
                    topPathsData={topPathsData}
                    topErrorPathsData={topErrorPathsData}
                    loading={loading}
                  />
                )
              },
              {
                key: '2',
                label: (
                  <span className="flex items-center">
                    <LineChartOutlined className="mr-1" />
                    性能分析
                  </span>
                ),
                children: (
                  <ApiPerformancePanel
                    apiPerformance={apiPerformance}
                    apiPerformanceData={apiPerformanceData}
                    loading={performanceLoading}
                  />
                )
              },
              {
                key: '3',
                label: (
                  <span className="flex items-center">
                    <ClockCircleOutlined className="mr-1" />
                    实时监控
                  </span>
                ),
                children: (
                  <ApiRealtimePanel
                    realtimeData={realtimeData}
                    loading={realtimeLoading}
                  />
                )
              }
            ]}
          />
        </Spin>
      </div>
    </div>
  );
};

export default ApiMonitor;