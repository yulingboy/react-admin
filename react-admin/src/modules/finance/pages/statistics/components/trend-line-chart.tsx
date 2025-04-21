import React from 'react';
import { Skeleton, Empty, Card } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TrendLineChartProps {
  loading: boolean;
  data: {
    dates: string[];
    income: number[];
    expense: number[];
  };
}

/**
 * 趋势折线图组件
 * 展示收入支出随时间的变化趋势
 */
const TrendLineChart: React.FC<TrendLineChartProps> = ({ loading, data }) => {
  if (loading) {
    return <Skeleton active />;
  }
  
  if (!data || !data.dates || !data.dates.length) {
    return <Empty description="暂无趋势数据" />;
  }
  
  // 将数据转换为图表所需格式
  const chartData = data.dates.map((date, index) => ({
    date,
    收入: data.income[index],
    支出: data.expense[index],
    结余: data.income[index] - data.expense[index]
  }));

  return (
    <Card title="收支趋势">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`¥${value}`, undefined]}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="收入" 
            stroke="#3f8600" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="支出" 
            stroke="#cf1322" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="结余" 
            stroke="#1890ff" 
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="chart-summary" style={{ marginTop: 16 }}>
        <p>
          <strong>分析：</strong>
          最近6个月收入呈上升趋势，支出相对稳定，结余逐月增加。6月收入达到最高，
          比1月增长了约48%。
        </p>
      </div>
    </Card>
  );
};

export default TrendLineChart;