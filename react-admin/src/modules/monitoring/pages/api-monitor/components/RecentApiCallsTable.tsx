import React from 'react';
import { Card, Table, Tooltip, Badge } from 'antd';
import { formatDateTime, formatMilliseconds } from '@/utils/formatters';

interface ApiCall {
  id: string;
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp?: string;
}

interface RecentApiCallsTableProps {
  title?: string;
  data: ApiCall[];
  loading: boolean;
  timestamp?: string;
}

const RecentApiCallsTable: React.FC<RecentApiCallsTableProps> = ({ title = '实时API调用', data, loading, timestamp }) => {
  // 实时调用记录表格列定义
  const columns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="max-w-xs md:max-w-sm truncate inline-block">{text}</span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text: string) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red'
        };
        return text ? <Badge color={colors[text] || 'default'} text={text} /> : '-';
      }
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 120,
      render: (code: number) => {
        let color = 'green';
        if (code >= 500) color = 'red';
        else if (code >= 400) color = 'orange';
        else if (code >= 300) color = 'blue';

        return <span style={{ color }}>{code}</span>;
      }
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 150,
      render: (value: number) => {
        let color = 'green';
        if (value > 1000) color = 'red';
        else if (value > 500) color = 'orange';

        return <span style={{ color }}>{formatMilliseconds(value)}</span>;
      }
    }
  ];

  return (
    <Card
      title={
        <span>
          {title}
          {timestamp && <small className="text-xs text-gray-400 ml-2">最后更新: {formatDateTime(timestamp)}</small>}
        </span>
      }
      className="w-full bg-white rounded-lg shadow-sm"
    >
      <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8 }} className="w-full" loading={loading} />
    </Card>
  );
};

export default RecentApiCallsTable;
