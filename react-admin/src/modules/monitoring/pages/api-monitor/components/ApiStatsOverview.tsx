import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ApiOutlined, WarningOutlined } from '@ant-design/icons';
import { ApiStatistics } from '@/common/types/system-monitor';
import { formatMilliseconds, formatPercent } from '@/utils/formatters';

interface ApiStatsOverviewProps {
  apiStats: ApiStatistics | null;
  loading: boolean;
}

const ApiStatsOverview: React.FC<ApiStatsOverviewProps> = ({ apiStats, loading }) => {
  if (!apiStats) return null;

  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card className="bg-white shadow-sm rounded-lg h-full" loading={loading}>
          <Statistic title="总请求数" value={apiStats.totalRequests} prefix={<ApiOutlined className="text-blue-500" />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="bg-white shadow-sm rounded-lg h-full" loading={loading}>
          <Statistic
            title="错误请求数"
            value={apiStats.totalErrors}
            prefix={<WarningOutlined className={apiStats.totalErrors > 0 ? 'text-red-500' : ''} />}
            valueStyle={{ color: apiStats.totalErrors > 0 ? '#ff4d4f' : undefined }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="bg-white shadow-sm rounded-lg h-full" loading={loading}>
          <Statistic
            title="错误率"
            value={formatPercent(apiStats.errorRate / 100, 1)}
            valueStyle={{
              color: apiStats.errorRate > 10 ? '#ff4d4f' : apiStats.errorRate > 5 ? '#faad14' : '#3f8600'
            }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="bg-white shadow-sm rounded-lg h-full" loading={loading}>
          <Statistic
            title="平均响应时间"
            value={formatMilliseconds(apiStats.avgResponseTime)}
            valueStyle={{
              color: apiStats.avgResponseTime > 1000 ? '#ff4d4f' : apiStats.avgResponseTime > 500 ? '#faad14' : '#3f8600'
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ApiStatsOverview;
