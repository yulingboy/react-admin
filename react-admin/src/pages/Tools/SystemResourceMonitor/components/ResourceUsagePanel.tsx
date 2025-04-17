import React from 'react';
import { Row, Col } from 'antd';
import { SystemResourceInfo } from '@/types/system-monitor';
import ResourceGaugeChart from './ResourceGaugeChart';
import SystemLoadCard from './SystemLoadCard';
import { formatBytes } from '@/utils/formatters';

interface ResourceUsagePanelProps {
  resources: SystemResourceInfo;
}

const ResourceUsagePanel: React.FC<ResourceUsagePanelProps> = ({ resources }) => {
  // CPU 状态判断
  const getCpuStatus = (usage: number) => {
    if (usage > 0.9) return 'exception';
    if (usage > 0.7) return 'warning';
    return 'normal';
  };

  // 内存状态判断
  const getMemStatus = (usage: number) => {
    if (usage > 0.9) return 'exception';
    if (usage > 0.7) return 'warning';
    return 'normal';
  };

  // 磁盘状态判断
  const getDiskStatus = (usage: number) => {
    if (usage > 0.9) return 'exception';
    if (usage > 0.7) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <ResourceGaugeChart
            title="CPU使用率"
            value={resources.cpuUsage}
            status={getCpuStatus(resources.cpuUsage)}
            description={<span className="text-base font-medium">{`${resources.cpuCores}核处理器`}</span>}
            extraContent={
              resources.systemInfo?.cpuModel && (
                <div className="text-xs text-gray-500 text-center mt-1 max-w-xs truncate">
                  {resources.systemInfo.cpuModel}
                </div>
              )
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <ResourceGaugeChart
            title="内存使用率"
            value={resources.memUsage}
            status={getMemStatus(resources.memUsage)}
            description={
              <span className="text-base font-medium">
                {`${formatBytes(resources.memoryUsed)} / ${formatBytes(resources.totalMemory)}`}
              </span>
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <ResourceGaugeChart
            title="磁盘使用率"
            value={resources.diskUsage}
            status={getDiskStatus(resources.diskUsage)}
            description={<span className="text-base font-medium">{`可用: ${formatBytes(resources.diskFree || 0)}`}</span>}
            extraContent={
              resources.systemInfo?.diskSize && (
                <div className="text-xs text-gray-500 mt-1">
                  {`总容量: ${formatBytes(resources.systemInfo.diskSize)}`}
                </div>
              )
            }
          />
        </Col>
      </Row>

      <SystemLoadCard
        loadAvg={resources.loadAvg}
        uptime={resources.uptime}
        cpuCores={resources.cpuCores}
      />
    </div>
  );
};

export default ResourceUsagePanel;