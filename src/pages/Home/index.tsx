import React from 'react';
import { Card, Statistic, Timeline, Row, Col, Avatar, Progress, Button } from 'antd';
import { ArrowUpOutlined, UserOutlined, ShoppingOutlined, EyeOutlined, DollarOutlined, MoreOutlined } from '@ant-design/icons';

const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card bordered={false} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
        <h1 className="text-2xl font-bold mb-2">欢迎使用React Admin</h1>
        <p className="opacity-80">这是一个基于React、TypeScript、Tailwind CSS和Ant Design的管理系统。</p>
        <Button type="primary" ghost className="mt-4">
          开始探索
        </Button>
      </Card>

      <Row gutter={[16, 16]}>
        {[
          { title: '用户数', value: 1285, change: 12, icon: <UserOutlined className="text-blue-500" /> },
          { title: '订单数', value: 8932, change: 23, icon: <ShoppingOutlined className="text-green-500" /> },
          { title: '访问量', value: 12569, change: 8, icon: <EyeOutlined className="text-purple-500" /> },
          { title: '收入', value: 89432, prefix: '¥', change: 32, icon: <DollarOutlined className="text-amber-500" /> }
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={
                  <div className="flex items-center justify-between">
                    <span>{stat.title}</span>
                    <Avatar size="small" icon={stat.icon} className="bg-gray-100" />
                  </div>
                }
                value={stat.value}
                precision={0}
                prefix={stat.prefix}
                valueStyle={{ fontWeight: 'bold' }}
                suffix={
                  <span className="text-green-500 text-sm ml-2">
                    <ArrowUpOutlined /> {stat.change}%
                  </span>
                }
              />
              <Progress
                percent={stat.change * 2}
                size="small"
                showInfo={false}
                strokeColor={index === 0 ? '#1677ff' : index === 1 ? '#52c41a' : index === 2 ? '#722ed1' : '#faad14'}
                className="mt-2"
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="活动概览" bordered={false} className="shadow-sm" extra={<Button type="text" icon={<MoreOutlined />} />}>
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-400 mb-4">图表区域</p>
              <div className="w-3/4 space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">本周完成率</span>
                    <span className="text-sm">70%</span>
                  </div>
                  <Progress percent={70} status="active" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">月度目标</span>
                    <span className="text-sm">45%</span>
                  </div>
                  <Progress percent={45} />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="最近活动"
            bordered={false}
            className="shadow-sm"
            extra={
              <Button type="link" size="small">
                查看全部
              </Button>
            }
          >
            <Timeline
              items={[
                {
                  color: 'blue',
                  children: (
                    <>
                      <p className="text-sm font-medium">用户小明完成了订单 #123456</p>
                      <p className="text-xs text-gray-400">10分钟前</p>
                    </>
                  )
                },
                {
                  color: 'green',
                  children: (
                    <>
                      <p className="text-sm font-medium">新产品已上架</p>
                      <p className="text-xs text-gray-400">1小时前</p>
                    </>
                  )
                },
                {
                  color: 'red',
                  children: (
                    <>
                      <p className="text-sm font-medium">系统检测到异常登录</p>
                      <p className="text-xs text-gray-400">2小时前</p>
                    </>
                  )
                },
                {
                  color: 'gray',
                  children: (
                    <>
                      <p className="text-sm font-medium">系统维护完成</p>
                      <p className="text-xs text-gray-400">昨天</p>
                    </>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
