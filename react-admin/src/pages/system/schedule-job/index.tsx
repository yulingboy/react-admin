import React, { useState, useRef } from 'react';
import { Button, Space, Card, message, Modal, Badge, Tooltip, Popconfirm, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CaretRightOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { 
  getScheduleJobs, 
  deleteScheduleJob, 
  startScheduleJob, 
  stopScheduleJob, 
  runScheduleJobOnce 
} from '@/api/schedule-job';
import { ScheduleJob, statusOptions } from '@/types/schedule-job';
import ScheduleJobForm from './components/schedule-job-form';
import ScheduleJobLog from './components/schedule-job-log';

const { confirm } = Modal;

const ScheduleJobList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [logVisible, setLogVisible] = useState<boolean>(false);
  const [currentJob, setCurrentJob] = useState<ScheduleJob | null>(null);
  const [currentLogJobId, setCurrentLogJobId] = useState<number | null>(null);
  const actionRef = useRef<ActionType>();

  // 刷新表格
  const refreshTable = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // 打开创建表单
  const handleCreate = () => {
    setCurrentJob(null);
    setFormVisible(true);
  };

  // 打开编辑表单
  const handleEdit = (record: ScheduleJob) => {
    setCurrentJob(record);
    setFormVisible(true);
  };

  // 关闭表单
  const handleFormCancel = () => {
    setFormVisible(false);
    setCurrentJob(null);
  };

  // 表单提交成功的回调
  const handleFormSuccess = () => {
    setFormVisible(false);
    setCurrentJob(null);
    refreshTable();
    message.success('操作成功');
  };

  // 打开日志面板
  const handleViewLogs = (jobId: number) => {
    setCurrentLogJobId(jobId);
    setLogVisible(true);
  };

  // 关闭日志面板
  const handleLogCancel = () => {
    setLogVisible(false);
    setCurrentLogJobId(null);
  };

  // 删除定时任务
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await deleteScheduleJob(id);
      message.success('删除成功');
      refreshTable();
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 启动定时任务
  const handleStart = async (id: number) => {
    try {
      setLoading(true);
      await startScheduleJob(id);
      message.success('启动成功');
      refreshTable();
    } catch (error) {
      message.error('启动失败');
      console.error('启动失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 停止定时任务
  const handleStop = async (id: number) => {
    try {
      setLoading(true);
      await stopScheduleJob(id);
      message.success('停止成功');
      refreshTable();
    } catch (error) {
      message.error('停止失败');
      console.error('停止失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 执行一次定时任务
  const handleRunOnce = async (id: number) => {
    confirm({
      title: '确认执行',
      icon: <ExclamationCircleOutlined />,
      content: '确定要立即执行一次该任务吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          await runScheduleJobOnce(id);
          message.success('任务执行指令已发送');
          refreshTable();
        } catch (error) {
          message.error('执行失败');
          console.error('执行失败:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 表格列定义
  const columns: ProColumns<ScheduleJob>[] = [
    {
      title: '任务ID',
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
      valueEnum: {
        DEFAULT: { text: '默认' },
        SYSTEM: { text: '系统' },
      },
    },
    {
      title: '调用目标',
      dataIndex: 'invokeTarget',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cronExpression',
      width: 120,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        '0': { text: '暂停', status: 'default' },
        '1': { text: '运行中', status: 'success' },
      },
      render: (_, record) => {
        const status = statusOptions.find(item => item.value === record.status);
        return (
          <Badge 
            status={record.status === '1' ? 'success' : 'default'} 
            text={status?.label || '未知'} 
          />
        );
      },
    },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      width: 90,
      search: false,
      render: (_, record) => (
        record.isSystem === '1' ? (
          <Tag color="blue">是</Tag>
        ) : (
          <Tag color="default">否</Tag>
        )
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          {record.status === '0' ? (
            <Tooltip title="启动">
              <Button 
                type="link" 
                icon={<PlayCircleOutlined />} 
                onClick={() => handleStart(record.id)}
                disabled={loading || record.isSystem === '1'}
              />
            </Tooltip>
          ) : (
            <Tooltip title="停止">
              <Button 
                type="link" 
                icon={<PauseCircleOutlined />} 
                danger
                onClick={() => handleStop(record.id)}
                disabled={loading || record.isSystem === '1'}
              />
            </Tooltip>
          )}
          <Tooltip title="执行一次">
            <Button 
              type="link" 
              icon={<CaretRightOutlined />} 
              onClick={() => handleRunOnce(record.id)}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="查看日志">
            <Button 
              type="link" 
              onClick={() => handleViewLogs(record.id)}
            >
              日志
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              disabled={record.isSystem === '1'}
            />
          </Tooltip>
          {record.isSystem !== '1' && (
            <Popconfirm
              title="确定要删除此任务吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />} 
                  disabled={loading || record.isSystem === '1'}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <ProTable<ScheduleJob>
        headerTitle="定时任务管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={handleCreate}>
            新建任务
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...restParams } = params;
          const response = await getScheduleJobs({
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

      {/* 创建/编辑表单对话框 */}
      {formVisible && (
        <ScheduleJobForm 
          visible={formVisible}
          job={currentJob}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* 任务日志对话框 */}
      {logVisible && currentLogJobId && (
        <ScheduleJobLog 
          visible={logVisible}
          jobId={currentLogJobId}
          onCancel={handleLogCancel}
        />
      )}
    </Card>
  );
};

export default ScheduleJobList;