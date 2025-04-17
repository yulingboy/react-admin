import React from 'react';
import { Card, Table, Tag, DatePicker } from 'antd';
import { LogStat } from '@/types/system-monitor';
import dayjs from 'dayjs';

interface LogStatsTableProps {
  loading: boolean;
  logStats: LogStat[];
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  onDateRangeChange: (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
}

const LogStatsTable: React.FC<LogStatsTableProps> = ({ loading, logStats, dateRange, onDateRangeChange }) => {
  // 日志统计表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colorMap: Record<string, string> = {
          ERROR: 'error',
          WARN: 'warning',
          INFO: 'success',
        };
        
        return <Tag color={colorMap[level] || 'default'}>{level}</Tag>;
      },
      filters: [
        { text: 'ERROR', value: 'ERROR' },
        { text: 'WARN', value: 'WARN' },
        { text: 'INFO', value: 'INFO' },
      ],
      onFilter: (value: string, record: LogStat) => record.level === value,
    },
    {
      title: '日志数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: LogStat, b: LogStat) => a.count - b.count,
    },
  ];

  return (
    <Card 
      title="日志统计数据" 
      className="w-full bg-white rounded-lg shadow-sm"
      extra={
        <DatePicker.RangePicker 
          onChange={(dates) => {
            onDateRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
          }} 
          value={dateRange}
        />
      }
    >
      <Table
        dataSource={logStats}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="middle"
        className="w-full"
        loading={loading && logStats.length === 0}
      />
    </Card>
  );
};

export default LogStatsTable;