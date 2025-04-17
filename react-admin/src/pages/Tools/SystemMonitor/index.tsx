import React from 'react';
import { Card, Row, Col, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { DashboardOutlined, ApiOutlined, FileTextOutlined } from '@ant-design/icons';
import { useSystemHealth } from './hooks/useSystemHealth';
import SystemHealthCard from './components/SystemHealthCard';
import './index.css';

const SystemMonitor: React.FC = () => {
  const { healthStatus, loading, refreshHealth } = useSystemHealth();
  
  // 模块卡片配置
  const monitorModules = [
    {
      title: '系统资源监控',
      icon: <DashboardOutlined className="module-icon" />,
      description: '监控服务器CPU、内存、磁盘使用率和系统负载情况',
      path: '/tools/system-monitor/resources',
      status: healthStatus?.checks?.cpu?.status || 'healthy'
    },
    {
      title: 'API监控',
      icon: <ApiOutlined className="module-icon" />,
      description: '监控API调用情况、响应时间、错误率等性能指标',
      path: '/tools/system-monitor/api',
      status: healthStatus?.checks?.api?.status || 'healthy'
    },
    {
      title: '日志统计',
      icon: <FileTextOutlined className="module-icon" />,
      description: '统计分析系统日志数量、类型和趋势变化',
      path: '/tools/system-monitor/logs',
      status: healthStatus?.checks?.logs?.status || 'healthy'
    }
  ];

  return (
    <div className="system-monitor-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Alert
            message="系统监控仪表盘"
            description="通过系统监控模块，您可以全面了解系统的运行状态、性能指标和潜在问题，及时发现并解决系统异常"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <SystemHealthCard 
            healthStatus={healthStatus} 
            loading={loading} 
            onRefresh={refreshHealth}
          />
        </Col>
        
        {monitorModules.map((module, index) => (
          <Col xs={24} sm={24} md={8} key={index}>
            <Link to={module.path} style={{ textDecoration: 'none' }}>
              <Card 
                hoverable 
                className={`monitor-module-card status-${module.status}`}
                bordered={false}
              >
                <div className="module-header">
                  <div className="module-icon-wrapper">
                    {module.icon}
                  </div>
                  <div className="module-status-indicator" title={`状态: ${module.status === 'healthy' ? '正常' : module.status === 'warning' ? '警告' : '异常'}`} />
                </div>
                <h2 className="module-title">{module.title}</h2>
                <p className="module-description">{module.description}</p>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SystemMonitor;