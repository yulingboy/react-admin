import React from 'react';
import { Card, Table, Tooltip, Badge } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatPercent } from '@/utils/formatters';

interface ApiPathItem {
  key: string;
  path: string;
  method?: string;
  count: number;
  responseTime?: number;
  error?: number;
  errorRate?: number;
}

interface ApiPathsTableProps {
  title: string;
  data: ApiPathItem[];
  loading: boolean;
  tooltipText?: string;
  showMethod?: boolean;
  showErrorRate?: boolean;
  showResponseTime?: boolean;
}

const ApiPathsTable: React.FC<ApiPathsTableProps> = ({
  title,
  data,
  loading,
  tooltipText,
  showMethod = false,
  showErrorRate = false,
  showResponseTime = false
}) => {
  // 基础列定义
  const baseColumns = [
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="max-w-xs md:max-w-sm truncate inline-block">
            {text}
          </span>
        </Tooltip>
      ),
      ellipsis: true
    },
    {
      title: '调用次数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: ApiPathItem, b: ApiPathItem) => a.count - b.count,
      width: 120,
    }
  ];

  // 根据需要添加其他列
  const columns = [...baseColumns];
  
  // 添加方法列
  if (showMethod) {
    columns.splice(1, 0, {
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
      },
    });
  }

  // 添加错误率列
  if (showErrorRate) {
    columns.push({
      title: '错误次数',
      dataIndex: 'error',
      key: 'error',
      width: 120,
      render: (text: number) => text > 0 ? <span className="text-red-500">{text}</span> : text,
    });

    columns.push({
      title: '错误率',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 120,
      render: (value: number) => {
        let color = 'green';
        if (value > 0.5) color = 'red';
        else if (value > 0.2) color = 'orange';
        
        return <span style={{ color }}>{formatPercent(value / 100, 1)}</span>;
      },
    });
  }

  // 添加响应时间列
  if (showResponseTime) {
    columns.push({
      title: '响应时间(ms)',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 150,
      render: (value: number) => {
        let color = 'green';
        if (value > 1000) color = 'red';
        else if (value > 500) color = 'orange';
        
        return <span style={{ color }}>{value?.toFixed(2)}</span>;
      },
      sorter: (a: ApiPathItem, b: ApiPathItem) => (a.responseTime || 0) - (b.responseTime || 0),
    });
  }

  return (
    <Card 
      title={title} 
      className="w-full bg-white rounded-lg shadow-sm"
      extra={tooltipText && (
        <Tooltip title={tooltipText}>
          <InfoCircleOutlined className="text-gray-400" />
        </Tooltip>
      )}
    >
      <Table 
        dataSource={data}
        columns={columns} 
        rowKey="key"
        size="small"
        pagination={false}
        className="w-full"
        loading={loading}
      />
    </Card>
  );
};

export default ApiPathsTable;