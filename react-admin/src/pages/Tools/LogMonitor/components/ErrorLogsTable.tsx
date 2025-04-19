import React from 'react';
import { Card, Table, Tag, Button, Tooltip } from 'antd';
import { ErrorLog } from '@/types/system-monitor';
import dayjs from 'dayjs';

interface ErrorLogsTableProps {
  loading: boolean;
  errorLogs: ErrorLog[];
  onRefresh: () => void;
}

const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ loading, errorLogs, onRefresh }) => {
  // 错误日志表格列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      width: 180
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => <Tag color="error">{level}</Tag>,
      width: 100
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false
      },
      render: (message: string) => (
        <Tooltip placement="topLeft" title={message}>
          {message}
        </Tooltip>
      )
    }
  ];

  return (
    <Card
      title="最近错误日志"
      className="w-full bg-white rounded-lg shadow-sm"
      extra={
        <Button type="primary" danger size="small" onClick={onRefresh}>
          刷新错误日志
        </Button>
      }
    >
      <Table
        dataSource={errorLogs}
        columns={columns}
        rowKey={record => `${record.timestamp}-${Math.random()}`}
        pagination={{ pageSize: 10 }}
        size="middle"
        className="w-full"
        loading={loading && errorLogs.length === 0}
      />
    </Card>
  );
};

export default ErrorLogsTable;
