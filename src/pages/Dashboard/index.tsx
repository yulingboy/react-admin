import React from 'react';
import { Card, Statistic, Table, Tag, Row, Col, Button, Progress } from 'antd';
import { MoreOutlined, UserOutlined, ShoppingOutlined, FundOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  // 仪表盘数据
  const stats = [
    {
      label: '总销售额',
      value: 126560,
      prefix: '¥',
      ratio: 25,
      icon: <FundOutlined className="text-blue-500 text-2xl" />,
      description: '与上月相比'
    },
    {
      label: '访问量',
      value: 8846,
      ratio: -12,
      icon: <UserOutlined className="text-purple-500 text-2xl" />,
      description: '与上周相比'
    },
    {
      label: '订单量',
      value: 1286,
      ratio: 15,
      icon: <ShoppingOutlined className="text-green-500 text-2xl" />,
      description: '与昨日相比'
    },
    {
      label: '用户增长',
      value: 256,
      ratio: 8,
      icon: <ShoppingCartOutlined className="text-amber-500 text-2xl" />,
      description: '与上月相比'
    }
  ];

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === '已完成' ? 'success' : status === '处理中' ? 'warning' : 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  const data = [
    { key: '1', id: 'ORD-001', customer: '张三', date: '2023-05-12', amount: '¥1,200', status: '已完成' },
    { key: '2', id: 'ORD-002', customer: '李四', date: '2023-05-11', amount: '¥860', status: '处理中' },
    { key: '3', id: 'ORD-003', customer: '王五', date: '2023-05-10', amount: '¥2,400', status: '已完成' },
    { key: '4', id: 'ORD-004', customer: '赵六', date: '2023-05-09', amount: '¥1,500', status: '已取消' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                {stat.icon}
                <span className={`text-xs px-2 py-1 rounded-full ${stat.ratio > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.ratio > 0 ? '+' : ''}
                  {stat.ratio}%
                </span>
              </div>
              <Statistic
                title={<span className="text-gray-500">{stat.label}</span>}
                value={stat.value}
                precision={0}
                prefix={stat.prefix}
                valueStyle={{ fontWeight: 'bold' }}
              />
              <div className="text-xs text-gray-400 mt-2">{stat.description}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="销售趋势" bordered={false} className="shadow-sm" extra={<Button type="text" icon={<MoreOutlined />} />}>
            <div className="h-80 bg-gray-50 rounded flex flex-col items-center justify-center">
              <p className="text-gray-400">销售趋势图表</p>
              <div className="w-3/4 mt-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm">本月销售额</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <Progress percent={68} status="active" strokeColor="#1677ff" />

                <div className="mt-4 mb-2 flex justify之间">
                  <span className="text-sm">上月销售额</span>
                  <span className="text-sm font-medium">52%</span>
                </div>
                <Progress percent={52} strokeColor="#52c41a" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="访问来源" bordered={false} className="shadow-sm" extra={<Button type="text" icon={<MoreOutlined />} />}>
            <div className="h-80 bg-gray-50 rounded flex flex-col items-center justify-center">
              <p className="text-gray-400">访问来源饼图</p>
              <div className="mt-4 w-3/4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">直接访问</span>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">搜索引擎</span>
                  </div>
                  <span className="text-sm font-medium">32%</span>
                </div>
                <div className="flex items-center justify之间">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm">社交媒体</span>
                  </div>
                  <span className="text-sm font-medium">23%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="最近订单"
        bordered={false}
        className="shadow-sm"
        extra={
          <Button type="link" size="small">
            查看更多
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} pagination={false} size="middle" className="overflow-x-auto" />
      </Card>
    </div>
  );
};

export default Dashboard;
