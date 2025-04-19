import React from 'react';
import { Row, Col, Table, Badge, Card, Empty, Spin, Typography, Statistic } from 'antd';
import { RealtimeApiData } from '@/types/system-monitor';
import { Area } from '@ant-design/plots';
import { Pie } from '@ant-design/plots';

interface ApiRealtimePanelProps {
  realtimeData: RealtimeApiData | null;
  loading: boolean;
}

const ApiRealtimePanel: React.FC<ApiRealtimePanelProps> = ({ realtimeData, loading }) => {
  // 获取状态码对应的Badge状态
  const getStatusBadge = (status: number) => {
    if (status < 200) return <Badge status="default" text={status} />;
    if (status < 300) return <Badge status="success" text={status} />;
    if (status < 400) return <Badge status="processing" text={status} />;
    if (status < 500) return <Badge status="warning" text={status} />;
    return <Badge status="error" text={status} />;
  };

  // 获取HTTP方法对应的颜色
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'blue',
      POST: 'green',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple',
    };
    return colors[method] || 'gray';
  };

  // 表格列定义
  const recentCallsColumns = [
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method: string) => (
        <Badge color={getMethodColor(method)} text={method} />
      ),
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 90,
      render: (statusCode: number) => getStatusBadge(statusCode),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 120,
      sorter: (a: any, b: any) => a.responseTime - b.responseTime,
      render: (time: number) => {
        let color = 'green';
        if (time > 500) color = 'orange';
        if (time > 1000) color = 'red';
        return <span style={{ color }}>{time} ms</span>;
      },
    },
    {
      title: '内容大小',
      dataIndex: 'responseSize',
      key: 'responseSize',
      width: 120,
      render: (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      },
    },
    {
      title: '客户端IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  // 最慢API表格列定义
  const slowestApisColumns = [
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method: string) => (
        <Badge color={getMethodColor(method)} text={method} />
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 120,
      sorter: (a: any, b: any) => a.responseTime - b.responseTime,
      render: (time: number) => {
        let color = 'green';
        if (time > 500) color = 'orange';
        if (time > 1000) color = 'red';
        return <span style={{ color }}>{time} ms</span>;
      },
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 90,
      render: (statusCode: number) => getStatusBadge(statusCode),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  // 如果没有数据，显示空状态
  if (!realtimeData && !loading) {
    return <Empty description="暂无数据，请稍后再试" />;
  }

  // 准备饼图数据
  const pieData = realtimeData?.statusCodeDistribution
    ? realtimeData.statusCodeDistribution.map(item => ({
        type: `${item.statusCode} (${item.category})`,
        value: item.count,
        category: item.category,
      }))
    : [];

  // 饼图配置
  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
    },
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{value}',
      style: {
        fill: '#fff',
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.type, value: `${datum.value} 请求` };
      },
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '状态码\n分布',
      },
    },
    color: (d: any) => {
      const category = d.category;
      if (category === 'success') return '#52c41a';
      if (category === 'information') return '#1890ff';
      if (category === 'redirection') return '#722ed1';
      if (category === 'clientError') return '#faad14';
      if (category === 'serverError') return '#ff4d4f';
      return '#8c8c8c';
    },
  };

  // 准备折线图数据
  const trendData = realtimeData?.callTrend || [];

  // 折线图配置
  const areaConfig = {
    data: trendData,
    xField: 'time',
    yField: 'count',
    smooth: true,
    height: 220,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
    },
    line: {
      size: 2,
      color: '#1890ff',
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#1890ff',
        lineWidth: 2,
      },
    },
    meta: {
      time: {
        alias: '时间',
      },
      count: {
        alias: '请求数',
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '请求数', value: datum.count };
      },
    },
  };

  const lastUpdateTime = realtimeData
    ? new Date(realtimeData.timestamp).toLocaleString()
    : '---';

  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        <div className="text-xs text-gray-500 text-right mb-4">
          最后更新时间: {lastUpdateTime}
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="API调用趋势 (最近1小时)" loading={loading}>
              {trendData.length > 0 ? <Area {...areaConfig} /> : <Empty />}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="状态码分布" loading={loading}>
              {pieData.length > 0 ? <Pie {...pieConfig} /> : <Empty />}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="响应时间最长的API" loading={loading}>
              <Table
                dataSource={realtimeData?.slowestApis || []}
                columns={slowestApisColumns}
                rowKey={(record, index) => `slowest-${index}`}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="最近API调用" loading={loading}>
              <Table
                dataSource={realtimeData?.recentCalls || []}
                columns={recentCallsColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
                expandable={{
                  expandedRowRender: record => 
                    record.errorMessage ? (
                      <div className="text-red-500">
                        <Typography.Text type="danger" strong>错误信息: </Typography.Text>
                        {record.errorMessage}
                      </div>
                    ) : null,
                  rowExpandable: record => !!record.errorMessage,
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default ApiRealtimePanel;
