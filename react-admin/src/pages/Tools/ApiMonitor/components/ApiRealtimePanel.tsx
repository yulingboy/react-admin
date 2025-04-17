import React from 'react';
import { Row, Col } from 'antd';
import { RealtimeApiData } from '@/types/system-monitor';
import RecentApiCallsTable from './RecentApiCallsTable';
import StatusCodePieChart from './StatusCodePieChart';
import SlowestApisList from './SlowestApisList';

interface ApiRealtimePanelProps {
  realtimeData: RealtimeApiData | null;
  loading: boolean;
}

const ApiRealtimePanel: React.FC<ApiRealtimePanelProps> = ({
  realtimeData,
  loading
}) => {
  return (
    <div className="space-y-6">
      <Row>
        <Col span={24}>
          <RecentApiCallsTable
            data={realtimeData?.recentCalls || []}
            loading={loading}
            timestamp={realtimeData?.timestamp}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <StatusCodePieChart
            data={realtimeData?.statusCodeDistribution || []}
            loading={loading}
          />
        </Col>
        
        <Col xs={24} md={12}>
          <SlowestApisList
            data={realtimeData?.slowestApis || []}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ApiRealtimePanel;