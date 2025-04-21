import React from 'react';
import { Card, Row, Col, Statistic, Skeleton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface IncomeExpenseOverviewProps {
  loading: boolean;
  data: {
    income: number;
    expense: number;
    balance: number;
    incomeRatio: number;
    expenseRatio: number;
  };
}

/**
 * 收支概览组件
 * 展示总收入、总支出、结余及同比变化
 */
const IncomeExpenseOverview: React.FC<IncomeExpenseOverviewProps> = ({ loading, data }) => {
  if (loading) {
    return <Skeleton active />;
  }

  const { income, expense, balance, incomeRatio, expenseRatio } = data;

  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card>
          <Statistic
            title="总收入(元)"
            value={income}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix="¥"
            suffix={
              <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                {incomeRatio > 0 ? (
                  <span style={{ color: '#3f8600' }}>
                    <ArrowUpOutlined /> {(incomeRatio * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span style={{ color: '#cf1322' }}>
                    <ArrowDownOutlined /> {Math.abs(incomeRatio * 100).toFixed(1)}%
                  </span>
                )}
              </span>
            }
          />
          <div className="statistic-footer">同比</div>
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="总支出(元)"
            value={expense}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            prefix="¥"
            suffix={
              <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                {expenseRatio > 0 ? (
                  <span style={{ color: '#cf1322' }}>
                    <ArrowUpOutlined /> {(expenseRatio * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span style={{ color: '#3f8600' }}>
                    <ArrowDownOutlined /> {Math.abs(expenseRatio * 100).toFixed(1)}%
                  </span>
                )}
              </span>
            }
          />
          <div className="statistic-footer">同比</div>
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="结余(元)"
            value={balance}
            precision={2}
            valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
            prefix="¥"
          />
          <div className="statistic-footer">收入 - 支出</div>
        </Card>
      </Col>
    </Row>
  );
};

export default IncomeExpenseOverview;