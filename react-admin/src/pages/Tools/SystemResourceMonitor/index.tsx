import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import { DashboardOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { systemResourceApi } from '@/api/system-monitor';
import { SystemResourceInfo } from '@/types/system-monitor';

// 导入拆分后的子组件
import ResourceMonitorHeader from './components/ResourceMonitorHeader';
import ResourceUsagePanel from './components/ResourceUsagePanel';
import SystemInfoCards from './components/SystemInfoCards';

const SystemResourceMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<SystemResourceInfo | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 默认30秒刷新一次

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemResourceApi.getRealtime();
      // 处理数据，提取嵌套在systemInfo中的属性
      const processedData = {
        ...data,
        cpuCores: data.systemInfo?.cpus || 0,
        memoryUsed: data.systemInfo?.usedMemory || (data.systemInfo?.totalMemory - data.systemInfo?.freeMemory) || 0,
        totalMemory: data.systemInfo?.totalMemory || 0,
        diskFree: data.systemInfo?.diskFree || 0,
        loadAvg: data.systemInfo?.loadavg || [0, 0, 0],
      };
      
      setResources(processedData);
    } catch (err) {
      setError('获取系统资源数据失败，请稍后重试');
      console.error('获取系统资源数据错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和定时刷新
  useEffect(() => {
    fetchResourceData();
    
    const timer = setInterval(() => {
      fetchResourceData();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  if (error) {
    return (
      <div className="rounded-lg bg-white shadow">
        <ResourceMonitorHeader 
          refreshInterval={refreshInterval}
          onIntervalChange={handleIntervalChange}
          onRefresh={fetchResourceData}
          loading={loading}
        />
        <div className="p-4">
          <Alert message="错误" description={error} type="error" showIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <ResourceMonitorHeader 
        refreshInterval={refreshInterval}
        onIntervalChange={handleIntervalChange}
        onRefresh={fetchResourceData}
        loading={loading}
      />

      <div className="p-4">
        <Spin spinning={loading && !resources}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="mt-2"
            items={[
              {
                key: '1',
                label: (
                  <span className="flex items-center">
                    <DashboardOutlined className="mr-1" />
                    资源使用
                  </span>
                ),
                children: resources && <ResourceUsagePanel resources={resources} />
              },
              {
                key: '2',
                label: (
                  <span className="flex items-center">
                    <InfoCircleOutlined className="mr-1" />
                    系统信息
                  </span>
                ),
                children: resources?.systemInfo && <SystemInfoCards systemInfo={resources.systemInfo} />
              }
            ]}
          />
        </Spin>
      </div>
    </div>
  );
};

export default SystemResourceMonitor;