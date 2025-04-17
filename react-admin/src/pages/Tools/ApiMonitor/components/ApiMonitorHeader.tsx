import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined, ApiOutlined } from '@ant-design/icons';

interface ApiMonitorHeaderProps {
  refreshInterval: number;
  onIntervalChange: (interval: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

const ApiMonitorHeader: React.FC<ApiMonitorHeaderProps> = ({
  refreshInterval,
  onIntervalChange,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center mb-4 md:mb-0">
        <ApiOutlined className="text-blue-500 text-xl" />
        <span className="ml-2 text-lg font-medium">API监控</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded overflow-hidden border border-gray-200">
          <Button
            type={refreshInterval === 30000 ? 'primary' : 'default'}
            onClick={() => onIntervalChange(30000)}
            className="rounded-none"
          >
            30秒
          </Button>
          <Button
            type={refreshInterval === 60000 ? 'primary' : 'default'}
            onClick={() => onIntervalChange(60000)}
            className="rounded-none border-l border-r"
          >
            1分钟
          </Button>
          <Button
            type={refreshInterval === 300000 ? 'primary' : 'default'}
            onClick={() => onIntervalChange(300000)}
            className="rounded-none"
          >
            5分钟
          </Button>
        </div>

        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          刷新
        </Button>
      </div>
    </div>
  );
};

export default ApiMonitorHeader;