import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { LogAnalysis } from '@/common/types/system-monitor';

interface LogAnalysisOverviewProps {
  logAnalysis: LogAnalysis | null;
}

const LogAnalysisOverview: React.FC<LogAnalysisOverviewProps> = ({ logAnalysis }) => {
  if (!logAnalysis) return null;

  return (
    <Card title="最新日志分析结果" className="w-full bg-white rounded-lg shadow-sm mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Statistic title="分析文件" value={logAnalysis.filename} valueStyle={{ fontSize: '16px' }} className="p-2 bg-gray-50 rounded" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic title="总行数" value={logAnalysis.totalLines} className="p-2 bg-gray-50 rounded" />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Statistic
            title="错误日志"
            value={logAnalysis.errorCount}
            valueStyle={{ color: logAnalysis.errorCount > 0 ? '#cf1322' : undefined }}
            prefix={<WarningOutlined />}
            className="p-2 bg-red-50 rounded"
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Statistic
            title="警告日志"
            value={logAnalysis.warnCount}
            valueStyle={{ color: logAnalysis.warnCount > 0 ? '#faad14' : undefined }}
            className="p-2 bg-yellow-50 rounded"
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Statistic title="信息日志" value={logAnalysis.infoCount} valueStyle={{ color: '#52c41a' }} className="p-2 bg-green-50 rounded" />
        </Col>
      </Row>
    </Card>
  );
};

export default LogAnalysisOverview;
