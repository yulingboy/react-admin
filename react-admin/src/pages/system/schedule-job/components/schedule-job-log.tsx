import React, { useState, useRef } from 'react';
import { Modal, Button, message, Space, Popconfirm, Typography, Tag } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { getScheduleJobLogs, clearScheduleJobLogs } from '@/api/schedule-job';
import { ScheduleJobLog, jobResultOptions } from '@/types/schedule-job';

const { Text } = Typography;

interface ScheduleJobLogProps {
  visible: boolean;
  jobId: number;
  onCancel: () => void;
}

const ScheduleJobLogComponent: React.FC<ScheduleJobLogProps> = ({
  visible,
  jobId,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();

  // 刷新表格
  const refreshTable = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // 清空日志
  const handleClearLogs = async () => {
    try {
      setLoading(true);
      await clearScheduleJobLogs(jobId);
      message.success('日志清空成功');
      refreshTable();
    } catch (error) {
      message.error('清空日志失败');
      console.error('清空日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 确认清空日志对话框
  const confirmClearLogs = () => {
    Modal.confirm({
      title: '确认清空',
      icon: <ExclamationCircleOutlined />,
      content: '确定要清空该任务的所有执行日志吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: handleClearLogs,
    });
  };

  // 表格列定义
  const columns: ProColumns<ScheduleJobLog>[] = [
    {
      title: '日志ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      ellipsis: true,
    },
    {
      title: '任务组',
      dataIndex: 'jobGroup',
      width: 100,
    },
    {
      title: '调用目标',
      dataIndex: 'invokeTarget',
      ellipsis: true,
      search: false,
    },
    {
      title: '日志信息',
      dataIndex: 'jobMessage',
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueEnum: {
        '0': { text: '失败', status: 'error' },
        '1': { text: '成功', status: 'success' },
      },
      render: (_, record) => {
        const option = jobResultOptions.find(item => item.value === record.status);
        return (
          <Tag color={record.status === '1' ? 'success' : 'error'}>
            {option?.label || '未知'}
          </Tag>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      width: 100,
      search: false,
      render: (_, record) => {
        if (record.startTime && record.endTime) {
          const start = new Date(record.startTime).getTime();
          const end = new Date(record.endTime).getTime();
          const duration = end - start;
          
          // 格式化显示耗时
          if (duration < 1000) {
            return `${duration}ms`;
          } else if (duration < 60000) {
            return `${(duration / 1000).toFixed(2)}s`;
          } else {
            const minutes = Math.floor(duration / 60000);
            const seconds = ((duration % 60000) / 1000).toFixed(2);
            return `${minutes}m ${seconds}s`;
          }
        }
        return '-';
      },
    },
    {
      title: '异常信息',
      dataIndex: 'exceptionInfo',
      ellipsis: true,
      search: false,
      render: (text) => {
        if (!text) return '-';
        return (
          <Text type="danger" ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        );
      },
    },
  ];

  return (
    <Modal
      title="任务执行日志"
      open={visible}
      width={1200}
      maskClosable={false}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      bodyStyle={{ padding: '12px 0' }}
    >
      <ProTable<ScheduleJobLog>
        headerTitle="执行日志列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Popconfirm
            key="clear"
            title="确定要清空日志吗？"
            onConfirm={handleClearLogs}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              loading={loading}
            >
              清空日志
            </Button>
          </Popconfirm>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...restParams } = params;
          const response = await getScheduleJobLogs(jobId, {
            page: current,
            pageSize,
            ...restParams,
          });
          return {
            data: response.list || [],
            success: true,
            total: response.total || 0,
          };
        }}
        columns={columns}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
    </Modal>
  );
};

export default ScheduleJobLogComponent;