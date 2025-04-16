import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Alert, Button, Tooltip, Badge, Row, Col, Statistic } from 'antd';
import { ReloadOutlined, ApiOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getApiStatistics } from '@/api/system-monitor';
import { ApiStatistics } from '@/types/system-monitor';
import { formatMilliseconds, formatDateTime, formatPercent } from '@/utils/formatters';

interface ApiMonitorProps {
  refreshInterval?: number; // 刷新间隔，单位毫秒
}

// 为表格定义的类型
interface ApiPathItem {
  key: string;
  path: string;
  method?: string;
  count: number;
  error?: number;
  errorRate?: number;
}

const ApiMonitor: React.FC<ApiMonitorProps> = ({
  refreshInterval = 60000 // 默认60秒刷新一次
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<ApiStatistics | null>(null);
  
  // 从apiStats中提取的表格数据
  const [topPathsData, setTopPathsData] = useState<ApiPathItem[]>([]);
  const [topErrorPathsData, setTopErrorPathsData] = useState<ApiPathItem[]>([]);

  const fetchApiStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApiStatistics();
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

  // 首次加载和定时刷新
  useEffect(() => {
    fetchApiStats();
    
    const timer = setInterval(() => {
      fetchApiStats();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  // 请求量最大的API表格列定义
  const topPathsColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate block" style={{ maxWidth: 300 }}>
            {text}
          </span>
        </Tooltip>
      ),
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
      render: (text: string, record: ApiPathItem) => (
        <Tooltip title={`${record.method || ''} ${text}`}>
          <Badge 
            color={
              record.method === 'GET' ? 'green' :
              record.method === 'POST' ? 'blue' :
              record.method === 'PUT' ? 'orange' :
              record.method === 'DELETE' ? 'red' : 'default'
            }
            text={<span style={{fontWeight: (record.error || 0) > 0 ? 'bold' : 'normal'}}>{text}</span>}
          />
        </Tooltip>
      ),
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
        if (value > 50) color = 'red';
        else if (value > 20) color = 'orange';
        
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

  if (error) {
    return <Alert message="错误" description={error} type="error" showIcon />;
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ApiOutlined style={{ marginRight: 8 }} />
          <span>API调用监控</span>
          <Button 
            type="link" 
            icon={<ReloadOutlined />} 
            onClick={fetchApiStats} 
            style={{ marginLeft: 8 }}
            size="small"
          >
            刷新
          </Button>
        </div>
      }
      extra={
        <Tooltip title={`每${refreshInterval / 1000}秒自动刷新`}>
          <ClockCircleOutlined /> 自动刷新
        </Tooltip>
      }
    >
      <Spin spinning={loading}>
        {apiStats && (
          <>
            <Row gutter={16} className="mb-6">
              <Col span={6}>
                <Statistic 
                  title="总请求数" 
                  value={apiStats.totalRequests} 
                  prefix={<ApiOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="错误请求数" 
                  value={apiStats.totalErrors} 
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: apiStats.totalErrors > 0 ? '#ff4d4f' : undefined }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="错误率" 
                  value={formatPercent(apiStats.errorRate / 100, 1)} 
                  valueStyle={{ color: apiStats.errorRate > 10 ? '#ff4d4f' : apiStats.errorRate > 5 ? '#faad14' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="平均响应时间" 
                  value={formatMilliseconds(apiStats.avgResponseTime)} 
                  valueStyle={{ 
                    color: apiStats.avgResponseTime > 1000 ? '#ff4d4f' : 
                            apiStats.avgResponseTime > 500 ? '#faad14' : '#3f8600' 
                  }}
                />
              </Col>
            </Row>

            <Card title="请求量最多的API" size="small" className="mb-6">
              <Table 
                dataSource={topPathsData}
                columns={topPathsColumns} 
                rowKey="key"
                size="small"
                pagination={false}
              />
            </Card>

            <Card title="错误率最高的API" size="small">
              <Table 
                dataSource={topErrorPathsData}
                columns={topErrorPathsColumns} 
                rowKey="key"
                size="small"
                pagination={false}
              />
            </Card>
          </>
        )}
      </Spin>
    </Card>
  );
};

export default ApiMonitor;