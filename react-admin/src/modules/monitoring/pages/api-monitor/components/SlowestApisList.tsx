import React from 'react';
import { Card, Alert, Tooltip, Badge } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatMilliseconds } from '@/utils/formatters';

interface ApiItem {
  path: string;
  method: string;
  responseTime: number;
  requestCount: number;
}

interface SlowestApisListProps {
  data: ApiItem[];
  loading: boolean;
}

const SlowestApisList: React.FC<SlowestApisListProps> = ({ data, loading }) => {
  // 根据方法获取颜色
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red'
    };
    return colors[method] || 'default';
  };

  // 基于响应时间获取颜色
  const getResponseTimeColor = (time: number) => {
    if (time > 1000) return 'text-red-500';
    if (time > 500) return 'text-orange-400';
    return 'text-green-500';
  };

  return (
    <Card
      title="最慢的API"
      className="w-full bg-white rounded-lg shadow-sm h-full"
      extra={
        <Tooltip title="按响应时间排序的最慢API调用">
          <InfoCircleOutlined className="text-gray-400" />
        </Tooltip>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-[350px]">
          <span className="text-gray-400">加载中...</span>
        </div>
      ) : data && data.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {data.map((api, index) => (
            <li key={index} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center mb-2 sm:mb-0">
                <Badge color={getMethodColor(api.method)} text={<span className="font-mono">{api.method}</span>} className="mr-2" />
                <Tooltip title={api.path}>
                  <span className="max-w-xs sm:max-w-sm md:max-w-md truncate inline-block">{api.path}</span>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3 ml-8 sm:ml-0">
                <span className={`px-2 py-1 rounded text-xs ${getResponseTimeColor(api.responseTime)} bg-gray-100`}>
                  {formatMilliseconds(api.responseTime)}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{api.requestCount}次调用</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex justify-center items-center h-[350px]">
          <Alert message="暂无API响应时间数据" type="info" showIcon />
        </div>
      )}
    </Card>
  );
};

export default SlowestApisList;
