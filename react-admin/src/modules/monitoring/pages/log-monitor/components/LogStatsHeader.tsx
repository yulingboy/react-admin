import React from 'react';
import { Button } from 'antd';
import { FileTextOutlined, ReloadOutlined } from '@ant-design/icons';

interface LogStatsHeaderProps {
  refreshInterval: number;
  onIntervalChange: (interval: number) => void;
  onAnalyzeLogs: () => void;
  onRefreshData: () => void;
  loading: boolean;
  analyzingLogs: boolean;
}

const LogStatsHeader: React.FC<LogStatsHeaderProps> = ({ refreshInterval, onIntervalChange, onAnalyzeLogs, onRefreshData, loading, analyzingLogs }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center mb-4 md:mb-0">
        <FileTextOutlined className="text-blue-500 text-xl" />
        <span className="ml-2 text-lg font-medium">日志统计</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded overflow-hidden border border-gray-200">
          <Button type={refreshInterval === 60000 ? 'primary' : 'default'} onClick={() => onIntervalChange(60000)} className="rounded-none">
            1分钟
          </Button>
          <Button type={refreshInterval === 300000 ? 'primary' : 'default'} onClick={() => onIntervalChange(300000)} className="rounded-none border-l border-r">
            5分钟
          </Button>
          <Button type={refreshInterval === 600000 ? 'primary' : 'default'} onClick={() => onIntervalChange(600000)} className="rounded-none">
            10分钟
          </Button>
        </div>

        <Button type="primary" icon={<FileTextOutlined />} loading={analyzingLogs} onClick={onAnalyzeLogs}>
          分析最新日志
        </Button>

        <Button icon={<ReloadOutlined />} onClick={onRefreshData} loading={loading}>
          刷新数据
        </Button>
      </div>
    </div>
  );
};

export default LogStatsHeader;
