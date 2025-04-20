import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Row, Col, Spin, Radio, Skeleton, message } from 'antd';
import ResourceUsageCard from './components/resource-usage-card';
import ResourceUsageChart from './components/resource-usage-chart';
import SystemInfoPanel from './components/system-info-panel';
import { getHistoricalData, getLatestResourceData, getSystemInfoSummary } from '../../api/system-resource-api';

const ResourceMonitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [latestData, setLatestData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [timeRange, setTimeRange] = useState(24); // 默认显示24小时的数据
  
  // 添加防重复请求的标志
  const isFetchingLatest = useRef(false);
  const isFetchingHistorical = useRef(false);
  const isFetchingSystemInfo = useRef(false);

  // 获取最新数据
  const fetchLatestData = useCallback(async () => {
    // 如果正在获取数据，则跳过
    if (isFetchingLatest.current) return;
    
    try {
      isFetchingLatest.current = true;
      const response = await getLatestResourceData();
      
      // 后端直接返回数据对象，无需解构 response.data
      setLatestData(response);
    } catch (error) {
      console.error('获取最新系统资源数据失败:', error);
      message.error('获取系统资源数据失败，请稍后重试');
    } finally {
      isFetchingLatest.current = false;
    }
  }, []);

  // 获取历史数据
  const fetchHistoricalData = useCallback(async () => {
    // 如果正在获取数据，则跳过
    if (isFetchingHistorical.current) return;
    
    try {
      isFetchingHistorical.current = true;
      setLoading(true);
      
      const response = await getHistoricalData(timeRange);
      
      // 后端直接返回数组，无需解构 response.data
      if (Array.isArray(response)) {
        setHistoricalData(response);
      } else {
        console.warn('历史数据格式不是数组:', response);
        setHistoricalData([]);
      }
    } catch (error) {
      console.error('获取历史系统资源数据失败:', error);
      message.error('获取历史数据失败，请稍后重试');
      setHistoricalData([]);
    } finally {
      setLoading(false);
      isFetchingHistorical.current = false;
    }
  }, [timeRange]);

  // 获取系统信息
  const fetchSystemInfo = useCallback(async () => {
    // 如果正在获取数据，则跳过
    if (isFetchingSystemInfo.current) return;
    
    try {
      isFetchingSystemInfo.current = true;
      const response = await getSystemInfoSummary();
      
      // 后端直接返回数据对象，无需解构 response.data
      setSystemInfo(response);
    } catch (error) {
      console.error('获取系统信息失败:', error);
      message.error('获取系统信息失败，请稍后重试');
    } finally {
      isFetchingSystemInfo.current = false;
    }
  }, []);

  // 初始加载 - 使用useEffect和useCallback确保只执行一次
  useEffect(() => {
    const initialLoad = async () => {
      try {
        // 依次调用而不是并行调用，避免同时发出多个请求
        await fetchLatestData();
        await fetchHistoricalData();
        await fetchSystemInfo();
      } catch (error) {
        console.error('初始化加载数据失败:', error);
      }
    };

    initialLoad();

    // 设置定时刷新（每30秒更新一次最新数据）
    const refreshInterval = setInterval(fetchLatestData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchLatestData, fetchHistoricalData, fetchSystemInfo]);

  // 当时间范围改变时重新获取历史数据
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]); // fetchHistoricalData已经依赖于timeRange

  return (
    <div className="p-4">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">系统资源监控</h2>
              <div className="flex items-center">
                <span className="mr-2 text-gray-500">时间范围:</span>
                <Radio.Group 
                  buttonStyle="solid" 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <Radio.Button value={6}>6小时</Radio.Button>
                  <Radio.Button value={12}>12小时</Radio.Button>
                  <Radio.Button value={24}>24小时</Radio.Button>
                  <Radio.Button value={72}>3天</Radio.Button>
                  <Radio.Button value={168}>7天</Radio.Button>
                </Radio.Group>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {latestData ? (
          <>
            <Col xs={24} sm={8}>
              <ResourceUsageCard 
                title="CPU 使用率" 
                value={latestData.cpuUsage?.toFixed(2) || '0.00'} 
                unit="%" 
                type="cpu"
              />
            </Col>
            <Col xs={24} sm={8}>
              <ResourceUsageCard 
                title="内存使用率" 
                value={latestData.memUsage?.toFixed(2) || '0.00'} 
                unit="%" 
                type="memory"
              />
            </Col>
            <Col xs={24} sm={8}>
              <ResourceUsageCard 
                title="磁盘使用率" 
                value={latestData.diskUsage?.toFixed(2) || '0.00'} 
                unit="%" 
                type="disk"
              />
            </Col>
          </>
        ) : (
          <>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="shadow-sm">
                <Skeleton active />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="shadow-sm">
                <Skeleton active />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} className="shadow-sm">
                <Skeleton active />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">资源使用趋势</h3>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <Spin tip="加载中..." />
              </div>
            ) : (
              <ResourceUsageChart data={historicalData} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col span={24}>
          <Card bordered={false} className="shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-medium">系统信息</h3>
            </div>
            {systemInfo ? (
              <SystemInfoPanel systemInfo={systemInfo} />
            ) : (
              <Skeleton active rows={10} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResourceMonitor;