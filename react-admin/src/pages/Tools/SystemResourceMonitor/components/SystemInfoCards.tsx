import React from 'react';
import { Card, Row, Col, Statistic, Divider, Alert, Tag } from 'antd';
import { formatBytes } from '@/utils/formatters';
import { SystemInfo } from '@/types/system-monitor';

interface SystemInfoCardsProps {
  systemInfo: SystemInfo;
}

const SystemInfoCards: React.FC<SystemInfoCardsProps> = ({ systemInfo }) => {
  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card title="基本信息" className="w-full h-full bg-white rounded-lg shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">主机名</div>
                <div className="text-base font-medium">{systemInfo.hostname}</div>
              </div>
              <Divider className="my-2" />
              <div>
                <div className="text-sm text-gray-500">操作系统</div>
                <div className="text-base font-medium">{`${systemInfo.platform} ${systemInfo.arch}`}</div>
              </div>
              <Divider className="my-2" />
              <div>
                <div className="text-sm text-gray-500">系统版本</div>
                <div className="text-base font-medium">{systemInfo.release}</div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={16}>
          <Card title="系统详情" className="w-full h-full bg-white rounded-lg shadow-sm">
            {systemInfo.systemModel && (
              <div className="mb-4 text-gray-700">{systemInfo.systemModel}</div>
            )}
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="CPU型号" 
                  value={systemInfo.cpuModel || '未知'} 
                  valueStyle={{ fontSize: '14px', lineHeight: '1.4' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="CPU核心数" 
                  value={systemInfo.cpus || 0} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="总内存" 
                  value={formatBytes(systemInfo.totalMemory)} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="网络接口" className="w-full bg-white rounded-lg shadow-sm">
        {Object.keys(systemInfo.networkInterfaces).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(systemInfo.networkInterfaces).map(([name, interfaces]) => (
              <div key={name} className="border rounded-md p-3 bg-gray-50">
                <div className="font-medium mb-2">{name}:</div>
                {Array.isArray(interfaces) && interfaces.map((iface: any, idx) => (
                  <div key={idx} className="ml-2 mb-2 last:mb-0">
                    <div className="flex items-center mb-1">
                      <Tag color="blue" className="mr-2">{iface.family}</Tag>
                      <span className="text-sm">{iface.address}</span>
                    </div>
                    {iface.mac && (
                      <div className="text-xs text-gray-500 ml-1">MAC: {iface.mac}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Alert message="网络接口数据不可用" type="info" />
        )}
      </Card>
    </div>
  );
};

export default SystemInfoCards;