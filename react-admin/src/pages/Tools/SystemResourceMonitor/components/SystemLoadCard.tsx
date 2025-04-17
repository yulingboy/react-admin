import React from 'react';
import { Card, Row, Col, Statistic, Alert } from 'antd';
import { formatUptime } from '@/utils/formatters';

interface SystemLoadCardProps {
  loadAvg: number[];
  uptime: number;
  cpuCores: number;
}

const SystemLoadCard: React.FC<SystemLoadCardProps> = ({ loadAvg, uptime, cpuCores }) => {
  const getLoadColor = (load: number, cores: number) => {
    if (load > cores) return '#ff4d4f';
    if (load > cores * 0.7) return '#faad14';
    return '#3f8600';
  };

  return (
    <Card title="系统负载与运行时间" className="w-full bg-white rounded-lg shadow-sm">
      <Row gutter={[16, 16]}>
        {loadAvg && loadAvg.length >= 3 ? (
          <>
            <Col xs={24} sm={6}>
              <Statistic 
                title="系统负载（1分钟）" 
                value={loadAvg[0].toFixed(2)} 
                valueStyle={{ color: getLoadColor(loadAvg[0], cpuCores) }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic 
                title="系统负载（5分钟）" 
                value={loadAvg[1].toFixed(2)}
                valueStyle={{ color: getLoadColor(loadAvg[1], cpuCores) }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic 
                title="系统负载（15分钟）" 
                value={loadAvg[2].toFixed(2)}
                valueStyle={{ color: getLoadColor(loadAvg[2], cpuCores) }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {loadAvg[2] > cpuCores ? '系统负载过高' : '系统负载正常'}
              </div>
            </Col>
          </>
        ) : (
          <Col xs={24} sm={18}>
            <Alert message="系统负载数据不可用" type="warning" />
          </Col>
        )}
        <Col xs={24} sm={6}>
          <Statistic 
            title="系统运行时间" 
            value={formatUptime(uptime)}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default SystemLoadCard;