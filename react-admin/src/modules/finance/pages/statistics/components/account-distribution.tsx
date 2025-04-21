import React from 'react';
import { Card, Row, Col, Skeleton, Empty, Progress } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AccountDistributionProps {
  loading: boolean;
  data: {
    accounts: {
      name: string;
      value: number;
      percent: number;
    }[];
    total: number;
  };
}

/**
 * 账户分布组件
 * 展示不同账户的资金分布情况
 */
const AccountDistribution: React.FC<AccountDistributionProps> = ({ loading, data }) => {
  if (loading) {
    return <Skeleton active />;
  }
  
  if (!data || !data.accounts || !data.accounts.length) {
    return <Empty description="暂无账户数据" />;
  }
  
  // 颜色数组
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="账户资金分布">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.accounts}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`¥${value}`, '金额']}
                labelFormatter={(name) => `${name}`}
              />
              <Bar 
                dataKey="value" 
                fill="#8884d8" 
                name="账户余额"
                barSize={40}
              >
                {data.accounts.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      
      <Col span={12}>
        <Card title="账户占比详情">
          <div className="account-total">
            <div className="total-label">总资产</div>
            <div className="total-value">¥{data.total.toFixed(2)}</div>
          </div>
          
          <div className="account-list">
            {data.accounts.map((account, index) => (
              <div key={index} className="account-item">
                <div className="account-info">
                  <span className="account-name">{account.name}</span>
                  <span className="account-value">¥{account.value.toFixed(2)}</span>
                </div>
                <Progress 
                  percent={account.percent} 
                  size="small" 
                  strokeColor={COLORS[index % COLORS.length]}
                  format={(percent) => `${percent.toFixed(1)}%`}
                />
              </div>
            ))}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default AccountDistribution;