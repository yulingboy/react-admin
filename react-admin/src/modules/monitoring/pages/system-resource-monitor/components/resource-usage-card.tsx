import React from 'react';
import { Card, Progress } from 'antd';
import { 
  DashboardOutlined, 
  HddOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';

interface ResourceUsageCardProps {
  title: string;
  value: string;
  unit: string;
  type: 'cpu' | 'memory' | 'disk';
}

const ResourceUsageCard: React.FC<ResourceUsageCardProps> = ({ 
  title, 
  value, 
  unit, 
  type 
}) => {
  // 根据使用率确定颜色
  const getStatusColor = (val: number) => {
    if (val >= 90) return '#f5222d'; // 红色 - 危险
    if (val >= 70) return '#faad14'; // 黄色 - 警告
    return '#52c41a'; // 绿色 - 正常
  };

  // 根据类型选择图标
  const getIcon = (type: string) => {
    switch (type) {
      case 'cpu':
        return <DashboardOutlined className="text-2xl" />;
      case 'memory':
        return <DatabaseOutlined className="text-2xl" />;
      case 'disk':
        return <HddOutlined className="text-2xl" />;
      default:
        return null;
    }
  };

  const numValue = parseFloat(value);
  const statusColor = getStatusColor(numValue);

  return (
    <Card 
      bordered={false} 
      className="shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium text-base">{title}</div>
        {getIcon(type)}
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="text-3xl font-bold" style={{ color: statusColor }}>
          {value}
          <span className="text-sm ml-1">{unit}</span>
        </div>
      </div>
      <Progress 
        percent={numValue} 
        status={numValue >= 90 ? 'exception' : numValue >= 70 ? 'warning' : 'success'} 
        showInfo={false}
      />
    </Card>
  );
};

export default ResourceUsageCard;