import React from 'react';
import { Row, Col } from 'antd';
import { ApiStatistics } from '@/common/types/system-monitor';
import ApiStatsOverview from './ApiStatsOverview';
import ApiPathsTable from './ApiPathsTable';

interface ApiPathItem {
  key: string;
  path: string;
  method?: string;
  count: number;
  error?: number;
  errorRate?: number;
}

interface ApiOverviewPanelProps {
  apiStats: ApiStatistics | null;
  topPathsData: ApiPathItem[];
  topErrorPathsData: ApiPathItem[];
  loading: boolean;
}

const ApiOverviewPanel: React.FC<ApiOverviewPanelProps> = ({ apiStats, topPathsData, topErrorPathsData, loading }) => {
  return (
    <div className="space-y-6">
      <ApiStatsOverview apiStats={apiStats} loading={loading} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ApiPathsTable title="请求量最多的API" data={topPathsData} loading={loading} tooltipText="总调用次数排名前10的API接口" />
        </Col>

        <Col xs={24} lg={12}>
          <ApiPathsTable
            title="错误率最高的API"
            data={topErrorPathsData}
            loading={loading}
            tooltipText="错误率排名前10的API接口"
            showMethod={true}
            showErrorRate={true}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ApiOverviewPanel;
