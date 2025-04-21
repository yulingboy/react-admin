import React, { useState } from 'react';
import { Card, Tabs, DatePicker } from 'antd';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  AreaChartOutlined 
} from '@ant-design/icons';

// 引入模拟数据和组件
import { mockStatisticsData } from './mock-data';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

/**
 * 统计分析页面组件
 * 实现账单数据的多维度统计分析功能
 */
const BillStatistics: React.FC = () => {
  const [, setDateRange] = useState<[Date, Date] | null>(null);
  
  // 模拟数据
  const { 
    loading, 
    overviewData,
    categoryData,
    trendData,
    accountData
  } = mockStatisticsData;

  // 日期范围变化处理
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    // 在此处添加加载数据的逻辑
    console.log('加载日期范围数据:', dates);
  };

  return (
    <div className="page-container">
      <Card 
        title="财务统计分析" 
        extra={
          <RangePicker onChange={handleDateRangeChange} />
        }
      >
        <Tabs defaultActiveKey="overview">
          <TabPane 
            tab={<span><BarChartOutlined />收支概览</span>} 
            key="overview"
          >
            <div className="overview-content">
              <p>收入: ¥{overviewData.income}</p>
              <p>支出: ¥{overviewData.expense}</p>
              <p>结余: ¥{overviewData.balance}</p>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><PieChartOutlined />分类分析</span>} 
            key="category"
          >
            <div className="category-content">
              <p>支出分类:</p>
              <ul>
                {categoryData.expense.map((item: any, index: number) => (
                  <li key={index}>{item.name}: ¥{item.value} ({item.percent}%)</li>
                ))}
              </ul>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><LineChartOutlined />趋势分析</span>} 
            key="trend"
          >
            <div className="trend-content">
              <p>最近收支趋势:</p>
              <p>收入逐月增长，支出稳定，结余增加。</p>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><AreaChartOutlined />账户分析</span>} 
            key="account"
          >
            <div className="account-content">
              <p>账户资金分布:</p>
              <ul>
                {accountData.accounts.map((item: any, index: number) => (
                  <li key={index}>{item.name}: ¥{item.value} ({item.percent}%)</li>
                ))}
              </ul>
              <p>总资产: ¥{accountData.total}</p>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BillStatistics;