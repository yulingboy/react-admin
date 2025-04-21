import React, { useState } from 'react';
import { Card, Row, Col, Radio, Skeleton, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryPieChartProps {
  loading: boolean;
  data: {
    expense: {
      name: string;
      value: number;
      percent: number;
    }[];
    income: {
      name: string;
      value: number;
      percent: number;
    }[];
  };
}

/**
 * 分类饼图组件
 * 展示收入/支出分类占比
 */
const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ loading, data }) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  
  // 颜色数组
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];
  
  if (loading) {
    return <Skeleton active />;
  }
  
  const chartData = data[type] || [];
  
  if (!chartData.length) {
    return <Empty description="暂无分类数据" />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h3 className="chart-title">{type === 'expense' ? '支出' : '收入'}分类占比</h3>
        </Col>
        <Col>
          <Radio.Group 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            buttonStyle="solid"
          >
            <Radio.Button value="expense">支出</Radio.Button>
            <Radio.Button value="income">收入</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`¥${value}`, '金额']}
                labelFormatter={(name) => `${name}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        
        <Col span={12}>
          <Card title="分类详情">
            <ul className="category-list">
              {chartData.map((item, index) => (
                <li key={index} className="category-item">
                  <span 
                    className="category-color" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="category-name">{item.name}</span>
                  <span className="category-value">¥{item.value.toFixed(2)}</span>
                  <span className="category-percent">{item.percent.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CategoryPieChart;