import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Statistic, Typography, Spin, Alert, DatePicker, Button, Tag, Tabs, Tooltip } from 'antd';
import { FileTextOutlined, ReloadOutlined, BarChartOutlined, ArrowLeftOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { logStatsApi } from '@/api/system-monitor';
import { LogStat, LogAnalysis, LogTrend, LogDistribution, ErrorLog } from '@/types/system-monitor';
import { Area, Pie, Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import './index.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LogMonitorProps {
  refreshInterval?: number; // 刷新间隔时间（毫秒），默认为5分钟
}

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
          endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined
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

  // 日志统计表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colorMap: Record<string, string> = {
          ERROR: 'error',
          WARN: 'warning',
          INFO: 'success'
        };

        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
      filters: [
        { text: 'ERROR', value: 'ERROR' },
        { text: 'WARN', value: 'WARN' },
        { text: 'INFO', value: 'INFO' }
      ],
      onFilter: (value: string, record: LogStat) => record.level === value
    },
    {
      title: '日志数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: LogStat, b: LogStat) => a.count - b.count
    }
  ];

  // 错误日志表格列定义
  const errorColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      width: 180
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => <Tag color="error">{level}</Tag>,
      width: 100
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false
      },
      render: (message: string) => (
        <Tooltip placement="topLeft" title={message}>
          {message}
        </Tooltip>
      )
    }
  ];

  // 准备日志趋势图数据
  const renderLogTrends = () => {
    // 趋势图配置
    const trendConfig = {
      data: logTrends.reduce((acc: any[], trend) => {
        acc.push({ date: trend.date, type: 'ERROR', count: trend.ERROR });
        acc.push({ date: trend.date, type: 'WARN', count: trend.WARN });
        acc.push({ date: trend.date, type: 'INFO', count: trend.INFO });
        return acc;
      }, []),
      xField: 'date',
      yField: 'count',
      seriesField: 'type',
      color: ['#ff4d4f', '#faad14', '#52c41a'],
      meta: {
        count: {
          alias: '日志数量'
        },
        date: {
          alias: '日期',
          formatter: (value: string) => value.split('T')[0]
        }
      },
      xAxis: {
        tickCount: 5,
        label: {
          formatter: (value: string) => value.split('T')[0]
        }
      },
      slider: {
        start: 0,
        end: 1
      },
      legend: {
        position: 'top-right'
      }
    };

    return (
      <Card title="日志趋势" className="dashboard-card">
        <div className="chart-container">
          {logTrends.length > 0 ? (
            <Area {...trendConfig} />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Text type="secondary">暂无日志趋势数据</Text>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 渲染日志分布图
  const renderLogDistribution = () => {
    const colorMap: Record<string, string> = {
      ERROR: '#ff4d4f',
      WARN: '#faad14',
      INFO: '#52c41a'
    };

    // 饼图配置
    const pieConfig = {
      data: logDistribution,
      angleField: 'count',
      colorField: 'level',
      radius: 0.8,
      // 使用颜色数组而不是回调函数
      color: ['#ff4d4f', '#faad14', '#52c41a'],
      label: {
        type: 'outer',
        content: '{name}: {percentage}'
      },
      interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }]
    };

    return (
      <Card title="日志级别分布" className="dashboard-card">
        <div className="chart-container">
          {logDistribution.length > 0 ? (
            <Pie {...pieConfig} />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Text type="secondary">暂无日志分布数据</Text>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 渲染日志概览面板
  const renderOverview = () => {
    return (
      <Row gutter={[24, 24]}>
        {logAnalysis && (
          <Col span={24}>
            <Card title="最新日志分析结果" className="dashboard-card">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="分析文件" value={logAnalysis.filename} valueStyle={{ fontSize: '16px' }} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="总行数" value={logAnalysis.totalLines} />
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Statistic
                    title="错误日志"
                    value={logAnalysis.errorCount}
                    valueStyle={{ color: logAnalysis.errorCount > 0 ? '#cf1322' : undefined }}
                    prefix={<WarningOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Statistic title="警告日志" value={logAnalysis.warnCount} valueStyle={{ color: logAnalysis.warnCount > 0 ? '#faad14' : undefined }} />
                </Col>
                <Col xs={24} sm={8} md={4}>
                  <Statistic title="信息日志" value={logAnalysis.infoCount} valueStyle={{ color: '#52c41a' }} />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        <Col xs={24} md={12}>
          {renderLogTrends()}
        </Col>

        <Col xs={24} md={12}>
          {renderLogDistribution()}
        </Col>

        <Col span={24}>
          <Card
            title="日志统计数据"
            className="dashboard-card"
            extra={
              <DatePicker.RangePicker
                onChange={dates => {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                }}
              />
            }
          >
            <Table
              dataSource={logStats}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
              className="data-table"
              loading={loading && logStats.length === 0}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染错误日志面板
  const renderErrorLogs = () => {
    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title="最近错误日志"
            className="dashboard-card"
            extra={
              <Button type="primary" danger size="small" onClick={() => fetchData()}>
                刷新错误日志
              </Button>
            }
          >
            <Table
              dataSource={errorLogs}
              columns={errorColumns}
              rowKey={record => `${record.timestamp}-${Math.random()}`}
              pagination={{ pageSize: 10 }}
              size="middle"
              className="data-table"
              loading={loading && errorLogs.length === 0}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染日志分析面板
  const renderAnalysis = () => {
    // 按日期的日志数量柱状图配置
    const dateCountConfig = {
      data: logStats,
      isGroup: true,
      xField: 'date',
      yField: 'count',
      seriesField: 'level',
      color: ['#ff4d4f', '#faad14', '#52c41a'],
      label: {
        position: 'middle',
        layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }, { type: 'adjust-color' }]
      },
      meta: {
        count: { alias: '日志数量' },
        date: { alias: '日期' },
        level: { alias: '日志级别' }
      }
    };

    return (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="日志数量分析" className="dashboard-card">
            <div className="chart-container">
              {logStats.length > 0 ? (
                <Column {...dateCountConfig} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Text type="secondary">暂无日志数据</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Alert
            message="日志分析说明"
            description={
              <ul>
                <li>错误日志(ERROR): 表示系统出现严重问题，需要立即处理的错误</li>
                <li>警告日志(WARN): 表示系统可能存在潜在问题，但不影响系统正常运行</li>
                <li>信息日志(INFO): 表示系统正常运行的信息记录</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    );
  };

  if (error) {
    return (
      <div className="submodule-container">
        <div className="submodule-header">
          <div className="submodule-title">
            <Link to="/tools/system-monitor">
              <ArrowLeftOutlined style={{ marginRight: 12 }} />
            </Link>
            <FileTextOutlined />
            <span style={{ marginLeft: 8 }}>日志统计</span>
          </div>
        </div>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="submodule-container">
      <div className="submodule-header">
        <div className="submodule-title">
          <Link to="/tools/system-monitor">
            <ArrowLeftOutlined style={{ marginRight: 12 }} />
          </Link>
          <FileTextOutlined />
          <span style={{ marginLeft: 8 }}>日志统计</span>
        </div>
        <div>
          <Button.Group style={{ marginRight: 16 }}>
            <Button type={refreshInterval === 60000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(60000)}>
              1分钟
            </Button>
            <Button type={refreshInterval === 300000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(300000)}>
              5分钟
            </Button>
            <Button type={refreshInterval === 600000 ? 'primary' : 'default'} onClick={() => handleIntervalChange(600000)}>
              10分钟
            </Button>
          </Button.Group>

          <Button type="primary" icon={<FileTextOutlined />} loading={analyzingLogs} onClick={handleAnalyzeLogs} style={{ marginRight: 16 }}>
            分析最新日志
          </Button>

          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新数据
          </Button>
        </div>
      </div>

      <Spin spinning={loading && !logStats.length}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="log-monitor-tabs"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <InfoCircleOutlined />
                  日志概览
                </span>
              ),
              children: renderOverview()
            },
            {
              key: '2',
              label: (
                <span>
                  <WarningOutlined />
                  错误日志
                </span>
              ),
              children: renderErrorLogs()
            },
            {
              key: '3',
              label: (
                <span>
                  <BarChartOutlined />
                  日志分析
                </span>
              ),
              children: renderAnalysis()
            }
          ]}
        />
      </Spin>
    </div>
  );
};

export default LogMonitor;
