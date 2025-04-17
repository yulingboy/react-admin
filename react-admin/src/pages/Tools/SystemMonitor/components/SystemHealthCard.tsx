import React from 'react';
import { Card, Typography, Badge, Space, Spin, Tooltip, Button } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  SyncOutlined 
} from '@ant-design/icons';
import { SystemHealth } from '@/types/system-monitor';
import { formatDateTime } from '@/utils/formatters';

const { Title, Text } = Typography;

interface SystemHealthCardProps {
  healthStatus: SystemHealth | null;
  loading: boolean;
  onRefresh?: () => void;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ 
  healthStatus, 
  loading,
  onRefresh 
}) => {
  if (!healthStatus && !loading) {
    return (
      <Card className="health-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">无法获取系统健康状态</Text>
          {onRefresh && (
            <Button icon={<SyncOutlined />} onClick={onRefresh}>
              重试
            </Button>
          )}
        </Space>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'healthy':
        return <CheckCircleOutlined className="health-icon health-icon-healthy" />;
      case 'warning':
        return <ExclamationCircleOutlined className="health-icon health-icon-warning" />;
      case 'critical':
        return <CloseCircleOutlined className="health-icon health-icon-critical" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'healthy':
        return '正常';
      case 'warning':
        return '警告';
      case 'critical':
        return '异常';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderHealthChecks = () => {
    if (!healthStatus || !healthStatus.checks) return null;
    
    const { checks } = healthStatus;
    
    return (
      <div className="health-checks">
        <Tooltip title="CPU使用率状态">
          <span className={`health-check-item bg-${getStatusColor(checks.cpu.status)}`}>
            {getStatusIcon(checks.cpu.status)}
            <span>CPU: {getStatusText(checks.cpu.status)}</span>
          </span>
        </Tooltip>
        
        <Tooltip title="内存使用率状态">
          <span className={`health-check-item bg-${getStatusColor(checks.memory.status)}`}>
            {getStatusIcon(checks.memory.status)}
            <span>内存: {getStatusText(checks.memory.status)}</span>
          </span>
        </Tooltip>
        
        <Tooltip title="API调用状态">
          <span className={`health-check-item bg-${getStatusColor(checks.api.status)}`}>
            {getStatusIcon(checks.api.status)}
            <span>API: {getStatusText(checks.api.status)}</span>
          </span>
        </Tooltip>
        
        <Tooltip title="系统日志状态">
          <span className={`health-check-item bg-${getStatusColor(checks.logs.status)}`}>
            {getStatusIcon(checks.logs.status)}
            <span>日志: {getStatusText(checks.logs.status)}</span>
          </span>
        </Tooltip>
      </div>
    );
  };

  return (
    <Card 
      className="health-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text strong>系统健康状态</Text>
          {onRefresh && (
            <Button 
              type="text" 
              icon={<SyncOutlined spin={loading} />} 
              onClick={onRefresh}
            >
              刷新
            </Button>
          )}
        </div>
      }
    >
      <Spin spinning={loading}>
        {healthStatus && (
          <>
            <div className="health-status">
              {getStatusIcon(healthStatus.status)}
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  <Badge 
                    status={getStatusColor(healthStatus.status) as any} 
                    text={`系统状态: ${getStatusText(healthStatus.status)}`}
                  />
                </Title>
                <Text type="secondary">
                  最后更新: {formatDateTime(healthStatus.timestamp)}
                </Text>
              </Space>
            </div>
            {renderHealthChecks()}
          </>
        )}
      </Spin>
    </Card>
  );
};

export default SystemHealthCard;