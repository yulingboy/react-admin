import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Statistic, Typography, Spin, Alert, DatePicker, Button, Tag } from 'antd';
import { FileTextOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { getLogStats, getLogTrends, analyzeRecentLogs } from '@/api/system-monitor';
import { LogStat, LogAnalysis, LogTrend } from '@/types/system-monitor';
import dayjs from 'dayjs';
import { Area } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface LogMonitorProps {
  refreshInterval?: number; // 刷新间隔时间（毫秒），默认为5分钟
}

const LogMonitor: React.FC<LogMonitorProps> = ({ refreshInterval = 300000 }) => {
  const [logStats, setLogStats] = useState<LogStat[]>([]);
  const [logTrends, setLogTrends] = useState<LogTrend[]>([]);
  const [logAnalysis, setLogAnalysis] = useState<LogAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzingLogs, setAnalyzingLogs] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResult, trendsResult] = await Promise.all([
        getLogStats({
          startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
          endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        }),
        getLogTrends(7), // 默认获取过去7天的日志趋势
      ]);
      
      setLogStats(statsResult);
      setLogTrends(trendsResult);
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
      const result = await analyzeRecentLogs();
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

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colorMap: Record<string, string> = {
          ERROR: 'error',
          WARN: 'warning',
          INFO: 'success',
        };
        
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: '日志数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: LogStat, b: LogStat) => a.count - b.count,
    },
  ];

  // 准备日志趋势图数据
  const logTrendData: any[] = [];
  
  logTrends.forEach(trend => {
    logTrendData.push({
      date: trend.date,
      level: 'ERROR',
      count: trend.ERROR
    });
    
    logTrendData.push({
      date: trend.date,
      level: 'WARN',
      count: trend.WARN
    });
    
    logTrendData.push({
      date: trend.date,
      level: 'INFO',
      count: trend.INFO
    });
  });

  // 日志趋势配置
  const trendConfig = {
    data: logTrendData,
    xField: 'date',
    yField: 'count',
    seriesField: 'level',
    color: ['#ff4d4f', '#faad14', '#52c41a'],
    meta: {
      count: {
        alias: '日志数量',
      },
      date: {
        alias: '日期',
      },
    },
    animation: false,
    isStack: false,
    xAxis: {
      tickCount: 5,
    },
    slider: {
      start: 0,
      end: 1,
    },
    legend: {
      position: 'top-right',
    },
  };

  if (error) {
    return (
      <Alert
        type="error"
        message="获取日志统计数据失败"
        description={error}
        showIcon
      />
    );
  }

  return (
    <Spin spinning={loading && logStats.length === 0}>
      <Card 
        title="日志监控"
        className="shadow-md rounded-md"
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />} 
              loading={analyzingLogs}
              onClick={handleAnalyzeLogs}
            >
              分析最新日志
            </Button>
            <RangePicker 
              onChange={(dates) => {
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
              }} 
            />
            <ReloadOutlined 
              onClick={fetchData} 
              spin={loading} 
              style={{ cursor: 'pointer' }} 
            />
          </div>
        }
      >
        {logAnalysis && (
          <Card title="最新日志分析结果" size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="分析文件"
                  value={logAnalysis.filename}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="总行数"
                  value={logAnalysis.totalLines}
                />
              </Col>
              <Col xs={24} sm={8} md={4}>
                <Statistic
                  title="错误日志"
                  value={logAnalysis.errorCount}
                  valueStyle={{ color: logAnalysis.errorCount > 0 ? '#cf1322' : undefined }}
                />
              </Col>
              <Col xs={24} sm={8} md={4}>
                <Statistic
                  title="警告日志"
                  value={logAnalysis.warnCount}
                  valueStyle={{ color: logAnalysis.warnCount > 0 ? '#faad14' : undefined }}
                />
              </Col>
              <Col xs={24} sm={8} md={4}>
                <Statistic
                  title="信息日志"
                  value={logAnalysis.infoCount}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        )}
        
        <Card title="日志趋势" size="small" style={{ marginBottom: 24 }}>
          <div style={{ height: 300 }}>
            {logTrends.length > 0 ? (
              <Area {...trendConfig} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Text type="secondary">暂无日志趋势数据</Text>
              </div>
            )}
          </div>
        </Card>

        <Table
          dataSource={logStats}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>
    </Spin>
  );
};

export default LogMonitor;