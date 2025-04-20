import React from 'react';
import { Row, Col, Typography, Divider, Tag, Tooltip } from 'antd';
import { formatBytes } from '../../../../utils/format-utils';

const { Title, Text } = Typography;

interface SystemInfoPanelProps {
  systemInfo: {
    cpu: {
      manufacturer: string;
      brand: string;
      speed: number;
      cores: number;
      physicalCores: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
    };
    os: {
      platform: string;
      distro: string;
      release: string;
      kernel: string;
      arch: string;
    };
    disks: Array<{
      device: string;
      type: string;
      name: string;
      size: number;
    }>;
    network: Array<{
      iface: string;
      ip4: string;
      mac: string;
      type: string;
      speed: number;
    }>;
  };
}

const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ systemInfo }) => {
  return (
    <div className="system-info-panel">
      <Row gutter={[24, 16]}>
        <Col span={24} lg={12}>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <Title level={5} className="mb-2">CPU信息</Title>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <Text type="secondary">制造商</Text>
                <Text>{systemInfo.cpu.manufacturer}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">型号</Text>
                <Text>{systemInfo.cpu.brand}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">基础频率</Text>
                <Text>{systemInfo.cpu.speed} GHz</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">逻辑核心</Text>
                <Text>{systemInfo.cpu.cores}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">物理核心</Text>
                <Text>{systemInfo.cpu.physicalCores}</Text>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <Title level={5} className="mb-2">内存信息</Title>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <Text type="secondary">总内存</Text>
                <Text>{formatBytes(systemInfo.memory.total)}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">已使用</Text>
                <Text>{formatBytes(systemInfo.memory.used)}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">可用内存</Text>
                <Text>{formatBytes(systemInfo.memory.free)}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">使用率</Text>
                <Text>{((systemInfo.memory.used / systemInfo.memory.total) * 100).toFixed(2)}%</Text>
              </div>
            </div>
          </div>
        </Col>

        <Col span={24} lg={12}>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <Title level={5} className="mb-2">操作系统信息</Title>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <Text type="secondary">平台</Text>
                <Text>{systemInfo.os.platform}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">发行版</Text>
                <Text>{systemInfo.os.distro}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">版本</Text>
                <Text>{systemInfo.os.release}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">内核</Text>
                <Text>{systemInfo.os.kernel}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">架构</Text>
                <Text>{systemInfo.os.arch}</Text>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <Title level={5} className="mb-2">硬盘信息</Title>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 gap-3">
              {systemInfo.disks.map((disk, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <Text type="secondary">{disk.device}</Text>
                    <Tag color="blue" className="ml-2">{disk.type}</Tag>
                  </div>
                  <Text>{disk.name} ({formatBytes(disk.size)})</Text>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col span={24}>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Title level={5} className="mb-2">网络接口信息</Title>
            <Divider className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemInfo.network.map((iface, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between mb-2">
                    <Text strong>{iface.iface}</Text>
                    <Tag color={iface.type === 'wireless' ? 'green' : 'blue'}>{iface.type}</Tag>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between">
                      <Text type="secondary">IP地址</Text>
                      <Text>{iface.ip4 || '无'}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">MAC地址</Text>
                      <Text>{iface.mac}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">速率</Text>
                      <Text>{iface.speed ? `${iface.speed} Mbps` : '未知'}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SystemInfoPanel;