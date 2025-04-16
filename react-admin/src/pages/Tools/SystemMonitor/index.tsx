import React, { useState } from 'react';
import { Tabs, Card, Alert } from 'antd';
import { DashboardOutlined, ApiOutlined, FileTextOutlined } from '@ant-design/icons';
import SystemResourceMonitor from './components/SystemResourceMonitor';
import ApiMonitor from './components/ApiMonitor';
import LogMonitor from './components/LogMonitor';

const { TabPane } = Tabs;

const SystemMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统监控" bordered={false}>
        <Alert
          message="系统监控模块为您提供服务器资源、API调用和日志统计的实时监控功能"
          description="您可以通过此模块全面了解系统的运行状态、性能指标和潜在问题"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <DashboardOutlined />
                  系统资源
                </span>
              ),
              children: <SystemResourceMonitor refreshInterval={30000} />,
            },
            {
              key: '2',
              label: (
                <span>
                  <ApiOutlined />
                  API监控
                </span>
              ),
              children: <ApiMonitor refreshInterval={60000} />,
            },
            {
              key: '3',
              label: (
                <span>
                  <FileTextOutlined />
                  日志统计
                </span>
              ),
              children: <LogMonitor refreshInterval={300000} />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default SystemMonitor;