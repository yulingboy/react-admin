import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Statistic, Spin, Alert, Button, Tooltip, Badge, DatePicker, Space, Tabs } from 'antd';
import { ReloadOutlined, ApiOutlined, ClockCircleOutlined, WarningOutlined, ArrowLeftOutlined, LineChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { apiMonitorApi } from '@/api/system-monitor';
import { ApiStatistics, ApiPerformanceMetrics, RealtimeApiData } from '@/types/system-monitor';
import { formatMilliseconds, formatDateTime, formatPercent } from '@/utils/formatters';
import { Area, Column } from '@ant-design/plots';
import './index.css';

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

const { RangePicker } = DatePicker;

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

  // 首次加载和定时刷新
  useEffect(() => {
    const fetchAllData = () => {
      fetchApiStats();
      fetchApiPerformance();
      fetchRealtimeData();
    };
    
    fetchAllData();
    
    const timer = setInterval(fetchAllData, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  // 刷新间隔变更
  const handleIntervalChange = (interval: number) => {
    setRefreshInterval(interval);
  };

  // 请求量最大的API表格列定义
  const topPathsColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate-text" style={{ maxWidth: 300 }}>
            {text}
          </span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: ApiPathItem, b: ApiPathItem) => a.count - b.count,
      width: 120,
    }
  ];

  // 错误率最高的API表格列定义
  const topErrorPathsColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate-text" style={{ maxWidth: 300 }}>
            {text}
          </span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text: string) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red'
        };
        return text ? <Badge color={colors[text] || 'default'} text={text} /> : '-';
      },
    },
    {
      title: '错误次数',
      dataIndex: 'error',
      key: 'error',
      width: 120,
      render: (text: number) => text > 0 ? <span style={{ color: 'red' }}>{text}</span> : text,
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 120,
      render: (value: number) => {
        let color = 'green';
        if (value > 0.5) color = 'red';
        else if (value > 0.2) color = 'orange';
        
        return <span style={{ color }}>{formatPercent(value / 100, 1)}</span>;
      },
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      width: 120,
    },
  ];

  // API性能表格列定义
  const apiPerformanceColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate-text" style={{ maxWidth: 300 }}>
            {text}
          </span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text: string) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red'
        };
        return text ? <Badge color={colors[text] || 'default'} text={text} /> : '-';
      },
    },
    {
      title: '响应时间(ms)',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 150,
      render: (value: number) => {
        let color = 'green';
        if (value > 1000) color = 'red';
        else if (value > 500) color = 'orange';
        
        return <span style={{ color }}>{value.toFixed(2)}</span>;
      },
      sorter: (a: ApiPathItem, b: ApiPathItem) => (a.responseTime || 0) - (b.responseTime || 0),
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      width: 120,
    },
    {
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 120,
      render: (value: number) => {
        let color = 'green';
        if (value > 0.5) color = 'red';
        else if (value > 0.2) color = 'orange';
        
        return <span style={{ color }}>{formatPercent(value / 100, 1)}</span>;
      },
    },
  ];

  // 实时调用记录表格列定义
  const recentCallsColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate-text" style={{ maxWidth: 300 }}>
            {text}
          </span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text: string) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red'
        };
        return text ? <Badge color={colors[text] || 'default'} text={text} /> : '-';
      },
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 120,
      render: (code: number) => {
        let color = 'green';
        if (code >= 500) color = 'red';
        else if (code >= 400) color = 'orange';
        else if (code >= 300) color = 'blue';
        
        return <span style={{ color }}>{code}</span>;
      },
    },
    {
      title: '响应时间(ms)',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 150,
      render: (value: number) => {
        let color = 'green';
        if (value > 1000) color = 'red';
        else if (value > 500) color = 'orange';
        
        return <span style={{ color }}>{value.toFixed(2)}</span>;
      },
    },
  ];

  if (error) {
    return (
      <div className="submodule-container">
        <div className="submodule-header">
          <div className="submodule-title">
            <Link to="/tools/system-monitor">
              <ArrowLeftOutlined style={{ marginRight: 12 }} />
            </Link>
            <ApiOutlined />
            <span style={{ marginLeft: 8 }}>API监控</span>
          </div>
        </div>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  // 渲染概览面板
  const renderOverview = () => {
    return (
      <Row gutter={[24, 24]}>
        {apiStats && (
          <>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card">
                <Statistic 
                  title="总请求数" 
                  value={apiStats.totalRequests} 
                  prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card">
                <Statistic 
                  title="错误请求数" 
                  value={apiStats.totalErrors} 
                  prefix={<WarningOutlined style={{ color: apiStats.totalErrors > 0 ? '#ff4d4f' : undefined }} />}
                  valueStyle={{ color: apiStats.totalErrors > 0 ? '#ff4d4f' : undefined }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card">
                <Statistic 
                  title="错误率" 
                  value={formatPercent(apiStats.errorRate / 100, 1)} 
                  valueStyle={{ 
                    color: apiStats.errorRate > 10 ? '#ff4d4f' : 
                            apiStats.errorRate > 5 ? '#faad14' : '#3f8600' 
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card">
                <Statistic 
                  title="平均响应时间" 
                  value={formatMilliseconds(apiStats.avgResponseTime)} 
                  valueStyle={{ 
                    color: apiStats.avgResponseTime > 1000 ? '#ff4d4f' : 
                            apiStats.avgResponseTime > 500 ? '#faad14' : '#3f8600' 
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title="请求量最多的API" 
                className="dashboard-card"
                extra={<Tooltip title="总调用次数排名前10的API接口">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>}
              >
                <Table 
                  dataSource={topPathsData}
                  columns={topPathsColumns} 
                  rowKey="key"
                  size="small"
                  pagination={false}
                  className="data-table"
                  loading={loading}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title="错误率最高的API" 
                className="dashboard-card"
                extra={<Tooltip title="错误率排名前10的API接口">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>}
              >
                <Table 
                  dataSource={topErrorPathsData}
                  columns={topErrorPathsColumns} 
                  rowKey="key"
                  size="small"
                  pagination={false}
                  className="data-table"
                  loading={loading}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    );
  };

  // 渲染性能分析面板
  const renderPerformance = () => {
    if (!apiPerformance) return <Spin spinning={true} />;

    // 准备表现趋势的图表数据
    const trendConfig = {
      data: apiPerformance.performanceTrends,
      xField: 'date',
      yField: 'avgResponseTime',
      seriesField: 'date',
      color: '#1890ff',
      meta: {
        avgResponseTime: {
          alias: '平均响应时间(ms)',
        },
        date: {
          alias: '日期',
          formatter: (value: string) => {
            return value.split('T')[0];
          }
        },
      },
      xAxis: {
        tickCount: 5,
        label: {
          formatter: (value: string) => {
            return value.split('T')[0];
          }
        }
      },
    };

    // 请求量趋势图表配置
    const requestCountConfig = {
      data: apiPerformance.performanceTrends,
      xField: 'date',
      yField: 'requestCount',
      columnWidthRatio: 0.5,
      color: '#52c41a',
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
        },
      },
      meta: {
        requestCount: {
          alias: '请求数量',
        },
        date: {
          alias: '日期',
          formatter: (value: string) => {
            return value.split('T')[0];
          }
        },
      },
      xAxis: {
        label: {
          formatter: (value: string) => {
            return value.split('T')[0];
          }
        }
      },
    };

    // 错误率趋势图表配置
    const errorRateConfig = {
      data: apiPerformance.performanceTrends,
      xField: 'date',
      yField: 'errorRate',
      seriesField: 'date',
      color: function(errorRate: number) {
        if (errorRate > 0.2) return '#ff4d4f';
        if (errorRate > 0.05) return '#faad14';
        return '#52c41a';
      },
      meta: {
        errorRate: {
          alias: '错误率',
          formatter: (value: number) => formatPercent(value / 100, 1),
        },
        date: {
          alias: '日期',
        },
      },
      yAxis: {
        label: {
          formatter: (value: string) => formatPercent(parseFloat(value) / 100, 1),
        },
      },
    };

    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title="API响应时间趋势" 
            className="dashboard-card"
          >
            <div className="chart-container">
              <Area {...trendConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="API请求量趋势" className="dashboard-card">
            <div className="chart-container">
              <Column {...requestCountConfig} />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="API错误率趋势" className="dashboard-card">
            <div className="chart-container">
              <Area {...errorRateConfig} />
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title="API性能详情" 
            className="dashboard-card"
          >
            <Table 
              dataSource={apiPerformanceData}
              columns={apiPerformanceColumns} 
              rowKey="key"
              size="small"
              pagination={{ pageSize: 10 }}
              className="data-table"
              loading={performanceLoading}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染实时监控面板
  const renderRealtime = () => {
    if (!realtimeData) return <Spin spinning={true} />;

    // 状态码分布图表配置
    const statusCodeConfig = {
      data: realtimeData.statusCodeDistribution,
      angleField: '_sum.requestCount',
      colorField: 'statusCode',
      radius: 0.8,
      innerRadius: 0.6,
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: 14,
        },
      },
      interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
      statistic: {
        title: false,
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          formatter: () => '状态码\n分布',
        },
      },
      legend: {
        itemName: {
          formatter: (text: string) => {
            const code = parseInt(text);
            if (code >= 500) return `${text} (服务器错误)`;
            if (code >= 400) return `${text} (客户端错误)`;
            if (code >= 300) return `${text} (重定向)`;
            if (code >= 200) return `${text} (成功)`;
            return text;
          }
        }
      }
    };

    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title={
              <span>
                实时API调用 
                <small style={{ fontSize: '12px', color: 'rgba(0,0,0,.45)', marginLeft: '8px' }}>
                  最后更新: {realtimeData.timestamp ? formatDateTime(realtimeData.timestamp) : '未知'}
                </small>
              </span>
            } 
            className="dashboard-card"
          >
            <Table 
              dataSource={realtimeData.recentCalls}
              columns={recentCallsColumns} 
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              className="data-table"
              loading={realtimeLoading}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="状态码分布" 
            className="dashboard-card"
          >
            <div className="chart-container" style={{ height: 350 }}>
              {/* @ts-ignore - 这里类型定义可能有问题，但实际效果是正确的 */}
              {realtimeData.statusCodeDistribution && realtimeData.statusCodeDistribution.length > 0 ? (
                <div style={{ height: 350 }}>饼图占位 - 需要引入Pie组件</div>
              ) : (
                <Alert message="暂无状态码分布数据" type="info" showIcon />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title="最慢的API" 
            className="dashboard-card"
            extra={<Tooltip title="按响应时间排序的最慢API调用">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>}
          >
            {realtimeData.slowestApis && realtimeData.slowestApis.length > 0 ? (
              <ul className="slowest-api-list">
                {realtimeData.slowestApis.map((api, index) => (
                  <li key={index} className="slowest-api-item">
                    <div className="api-info">
                      <Badge 
                        color={
                          api.method === 'GET' ? 'green' :
                          api.method === 'POST' ? 'blue' :
                          api.method === 'PUT' ? 'orange' :
                          api.method === 'DELETE' ? 'red' : 'default'
                        }
                        text={<span>{api.method}</span>}
                      />
                      <Tooltip title={api.path}>
                        <span className="api-path">{api.path}</span>
                      </Tooltip>
                    </div>
                    <div className="api-metrics">
                      <span className="metric-badge response-time">
                        {formatMilliseconds(api.responseTime)}
                      </span>
                      <span className="metric-badge request-count">
                        {api.requestCount}次调用
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Alert message="暂无API响应时间数据" type="info" showIcon />
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="submodule-container">
      <div className="submodule-header">
        <div className="submodule-title">
          <Link to="/tools/system-monitor">
            <ArrowLeftOutlined style={{ marginRight: 12 }} />
          </Link>
          <ApiOutlined />
          <span style={{ marginLeft: 8 }}>API监控</span>
        </div>
        <div>
          <Button.Group style={{ marginRight: 16 }}>
            <Button 
              type={refreshInterval === 30000 ? 'primary' : 'default'} 
              onClick={() => handleIntervalChange(30000)}
            >
              30秒
            </Button>
            <Button 
              type={refreshInterval === 60000 ? 'primary' : 'default'} 
              onClick={() => handleIntervalChange(60000)}
            >
              1分钟
            </Button>
            <Button 
              type={refreshInterval === 300000 ? 'primary' : 'default'} 
              onClick={() => handleIntervalChange(300000)}
            >
              5分钟
            </Button>
          </Button.Group>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => {
              fetchApiStats();
              fetchApiPerformance();
              fetchRealtimeData();
            }}
            loading={loading || performanceLoading || realtimeLoading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="api-monitor-tabs"
        items={[
          {
            key: '1',
            label: (
              <span>
                <ApiOutlined />
                概览
              </span>
            ),
            children: renderOverview()
          },
          {
            key: '2',
            label: (
              <span>
                <LineChartOutlined />
                性能分析
              </span>
            ),
            children: renderPerformance()
          },
          {
            key: '3',
            label: (
              <span>
                <ClockCircleOutlined />
                实时监控
              </span>
            ),
            children: renderRealtime()
          }
        ]}
      />
    </div>
  );
};

export default ApiMonitor;