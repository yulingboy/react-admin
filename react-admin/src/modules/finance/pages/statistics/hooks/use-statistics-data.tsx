import { useState, useEffect } from 'react';
import { message } from 'antd';

/**
 * 财务统计数据钩子函数
 * 用于获取不同维度的统计数据
 */
export const useStatisticsData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [overviewData, setOverviewData] = useState<any>({});
  const [categoryData, setCategoryData] = useState<any>({});
  const [trendData, setTrendData] = useState<any>({});
  const [accountData, setAccountData] = useState<any>({});

  /**
   * 加载统计数据
   * @param dateRange 日期范围
   */
  const loadStatisticsData = async (dateRange?: any) => {
    setLoading(true);
    try {
      // 模拟数据加载
      // 实际项目中，这里应该调用API获取真实数据
      await mockDataLoading();
      
      // 设置收支概览数据
      setOverviewData({
        income: 12580.50,
        expense: 8965.25,
        balance: 3615.25,
        incomeRatio: 0.15,  // 同比增长率
        expenseRatio: -0.08 // 同比下降率
      });
      
      // 设置分类数据
      setCategoryData({
        expense: [
          { name: '餐饮', value: 3200.5, percent: 35.7 },
          { name: '交通', value: 1560.8, percent: 17.4 },
          { name: '购物', value: 1200.0, percent: 13.4 },
          { name: '娱乐', value: 980.25, percent: 10.9 },
          { name: '居住', value: 850.0, percent: 9.5 },
          { name: '其他', value: 1173.7, percent: 13.1 }
        ],
        income: [
          { name: '工资', value: 10000.0, percent: 79.5 },
          { name: '奖金', value: 1500.0, percent: 11.9 },
          { name: '副业', value: 800.5, percent: 6.4 },
          { name: '其他', value: 280.0, percent: 2.2 }
        ]
      });
      
      // 设置趋势数据
      setTrendData({
        dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
        income: [8500, 9200, 9800, 10500, 11200, 12580],
        expense: [7800, 8100, 8500, 8750, 8900, 8965]
      });
      
      // 设置账户数据
      setAccountData({
        accounts: [
          { name: '工商银行', value: 25680.5, percent: 45.2 },
          { name: '支付宝', value: 15890.3, percent: 28.0 },
          { name: '微信', value: 8960.25, percent: 15.8 },
          { name: '现金', value: 6250.0, percent: 11.0 }
        ],
        total: 56781.05
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      message.error('加载统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据加载延迟
  const mockDataLoading = () => {
    return new Promise(resolve => {
      setTimeout(resolve, 800);
    });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadStatisticsData();
  }, []);

  return {
    loading,
    overviewData,
    categoryData,
    trendData,
    accountData,
    loadStatisticsData
  };
};