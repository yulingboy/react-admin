import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, message, Modal } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { columns } from './components/table-columns';
import { getLoginLogs, batchDeleteLoginLogs, clearLoginLogs, getLoginLogDetail } from '@/api/login-log';
import dayjs from 'dayjs';

/**
 * 登录日志管理页面
 */
const LoginLogPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  /**
   * 查看日志详情
   */
  const handleViewDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await getLoginLogDetail(id);
      if (response?.code === 200) {
        setCurrentLog(response.data);
        setDetailVisible(true);
      } else {
        message.error(response?.message || '获取日志详情失败');
      }
    } catch (error) {
      message.error('获取日志详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 批量删除日志
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }

    try {
      const response = await batchDeleteLoginLogs(selectedRowKeys as number[]);
      if (response?.code === 200) {
        message.success('删除成功');
        actionRef.current?.reload();
        setSelectedRowKeys([]);
      } else {
        message.error(response?.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  /**
   * 清空所有日志
   */
  const handleClearAll = async () => {
    try {
      const response = await clearLoginLogs();
      if (response?.code === 200) {
        message.success('清空成功');
        actionRef.current?.reload();
        setSelectedRowKeys([]);
      } else {
        message.error(response?.message || '清空失败');
      }
    } catch (error) {
      message.error('清空失败');
    }
  };

  /**
   * 确认清空所有日志
   */
  const confirmClearAll = () => {
    Modal.confirm({
      title: '确认清空所有登录日志吗?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有登录日志记录，且不可恢复',
      onOk: handleClearAll,
    });
  };

  /**
   * 表格操作列配置
   */
  const actionColumn: ProColumns = {
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    width: 100,
    render: (_, record) => [
      <Button
        key="view"
        type="link"
        icon={<EyeOutlined />}
        onClick={() => handleViewDetail(record.id)}
      >
        查看
      </Button>,
    ],
  };

  // 合并操作列到表格列配置
  const tableColumns = [...columns, actionColumn];

  return (
    <PageContainer header={{ title: '登录日志' }}>
      <ProTable
        headerTitle="登录日志列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Popconfirm
            key="batchDelete"
            title="确认删除选中的日志吗?"
            onConfirm={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
          </Popconfirm>,
          <Button 
            key="clearAll" 
            danger
            onClick={confirmClearAll}
          >
            清空日志
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          // 处理排序
          const sortField = Object.keys(sort || {})[0];
          const sortOrder = sortField && (sort[sortField] === 'ascend' ? 'asc' : 'desc');
          
          // 处理日期范围
          const { loginTime, ...restParams } = params;
          const queryParams: any = {
            ...restParams,
            page: params.current || 1,
            pageSize: params.pageSize || 10,
          };
          
          // 添加时间范围查询参数
          if (loginTime && loginTime.length === 2) {
            queryParams.startTime = dayjs(loginTime[0]).format('YYYY-MM-DD HH:mm:ss');
            queryParams.endTime = dayjs(loginTime[1]).format('YYYY-MM-DD HH:mm:ss');
          }
          
          try {
            const response = await getLoginLogs(queryParams);
            if (response?.code === 200) {
              return {
                data: response.data.list,
                success: true,
                total: response.data.pagination.total,
              };
            } else {
              message.error(response?.message || '获取登录日志失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          } catch (error) {
            message.error('获取登录日志失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={tableColumns}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
      />

      {/* 日志详情弹窗 */}
      <Modal
        title="登录日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentLog && (
          <div className="p-4">
            <Space direction="vertical" className="w-full">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold">用户名: </span>
                  <span>{currentLog.username}</span>
                </div>
                <div>
                  <span className="font-bold">登录状态: </span>
                  <span>{currentLog.status === '1' ? '成功' : '失败'}</span>
                </div>
                <div>
                  <span className="font-bold">IP地址: </span>
                  <span>{currentLog.ipAddress}</span>
                </div>
                <div>
                  <span className="font-bold">登录地点: </span>
                  <span>{currentLog.loginLocation || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">浏览器: </span>
                  <span>{currentLog.browser || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">操作系统: </span>
                  <span>{currentLog.os || '未知'}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold">提示消息: </span>
                  <span>{currentLog.msg || '无'}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold">登录时间: </span>
                  <span>{dayjs(currentLog.loginTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default LoginLogPage;