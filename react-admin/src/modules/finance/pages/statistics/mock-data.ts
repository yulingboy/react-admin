/**
 * 模拟的统计数据
 * 用于页面展示测试
 */
export const mockStatisticsData = {
  loading: false,
  
  // 收支概览数据
  overviewData: {
    income: 12580.50,
    expense: 8965.25,
    balance: 3615.25,
    incomeRatio: 0.15,  // 同比增长率
    expenseRatio: -0.08 // 同比下降率
  },
  
  // 分类数据
  categoryData: {
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
  },
  
  // 趋势数据
  trendData: {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
    income: [8500, 9200, 9800, 10500, 11200, 12580],
    expense: [7800, 8100, 8500, 8750, 8900, 8965]
  },
  
  // 账户数据
  accountData: {
    accounts: [
      { name: '工商银行', value: 25680.5, percent: 45.2 },
      { name: '支付宝', value: 15890.3, percent: 28.0 },
      { name: '微信', value: 8960.25, percent: 15.8 },
      { name: '现金', value: 6250.0, percent: 11.0 }
    ],
    total: 56781.05
  }
};