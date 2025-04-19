import React from 'react';
import { Row, Col } from 'antd';
import { ApiPerformanceMetrics } from '@/types/system-monitor';
import ApiPerformanceTrendChart from './ApiPerformanceTrendChart';
import ApiPathsTable from './ApiPathsTable';

interface ApiPathItem {
  key: string;
  path: string;
  method?: string;
  count: number;
  responseTime?: number;
  error?: number;
  errorRate?: number;
}

interface ApiPerformancePanelProps {
  apiPerformance: ApiPerformanceMetrics | null;
  apiPerformanceData: ApiPathItem[];
  loading: boolean;
}

const ApiPerformancePanel: React.FC<ApiPerformancePanelProps> = ({ apiPerformance, apiPerformanceData, loading }) => {
  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <ApiPerformanceTrendChart title="API响应时间趋势" data={apiPerformance?.performanceTrends || []} loading={loading} type="response-time" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <ApiPerformanceTrendChart title="API请求量趋势" data={apiPerformance?.performanceTrends || []} loading={loading} type="request-count" />
        </Col>

        <Col xs={24} md={12}>
          <ApiPerformanceTrendChart title="API错误率趋势" data={apiPerformance?.performanceTrends || []} loading={loading} type="error-rate" />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <ApiPathsTable title="API性能详情" data={apiPerformanceData} loading={loading} showMethod={true} showResponseTime={true} showErrorRate={true} />
        </Col>
      </Row>
    </div>
  );
};

export default ApiPerformancePanel;
