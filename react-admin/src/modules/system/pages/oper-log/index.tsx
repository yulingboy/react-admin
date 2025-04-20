import React, { useRef, useState } from 'react';
import { Button, Popconfirm, Space, message, Modal } from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { columns } from './components/table-columns';
import { getOperLogs, batchDeleteOperLogs, clearOperLogs, getOperLogDetail } from '@/api/oper-log';
import dayjs from 'dayjs';

/**
 * 操作日志管理页面
 */
const OperLogPage: React.FC = () => {
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
      const response = await getOperLogDetail(id);
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
      const response = await batchDeleteOperLogs(selectedRowKeys as number[]);
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
      const response = await clearOperLogs();
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
      title: '确认清空所有操作日志吗?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有操作日志记录，且不可恢复',
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
    <PageContainer header={{ title: '操作日志' }}>
      <ProTable
        headerTitle="操作日志列表"
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
          const { operTime, ...restParams } = params;
          const queryParams: any = {
            ...restParams,
            page: params.current || 1,
            pageSize: params.pageSize || 10,
          };
          
          // 添加时间范围查询参数
          if (operTime && operTime.length === 2) {
            queryParams.startTime = dayjs(operTime[0]).format('YYYY-MM-DD HH:mm:ss');
            queryParams.endTime = dayjs(operTime[1]).format('YYYY-MM-DD HH:mm:ss');
          }
          
          try {
            const response = await getOperLogs(queryParams);
            if (response?.code === 200) {
              return {
                data: response.data.list,
                success: true,
                total: response.data.pagination.total,
              };
            } else {
              message.error(response?.message || '获取操作日志失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          } catch (error) {
            message.error('获取操作日志失败');
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
        title="操作日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentLog && (
          <div className="p-4">
            <Space direction="vertical" className="w-full">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold">操作模块: </span>
                  <span>{currentLog.title}</span>
                </div>
                <div>
                  <span className="font-bold">操作人员: </span>
                  <span>{currentLog.operName || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">请求方法: </span>
                  <span>{currentLog.requestMethod || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">业务类型: </span>
                  <span>
                    {currentLog.businessType === '0' && '其它'}
                    {currentLog.businessType === '1' && '新增'}
                    {currentLog.businessType === '2' && '修改'}
                    {currentLog.businessType === '3' && '删除'}
                    {currentLog.businessType === '4' && '授权'}
                    {currentLog.businessType === '5' && '导出'}
                    {currentLog.businessType === '6' && '导入'}
                    {currentLog.businessType === '7' && '强退'}
                    {currentLog.businessType === '8' && '清空数据'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">操作IP: </span>
                  <span>{currentLog.operIp || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">操作地点: </span>
                  <span>{currentLog.operLocation || '未知'}</span>
                </div>
                <div>
                  <span className="font-bold">操作状态: </span>
                  <span>{currentLog.status === '0' ? '正常' : '异常'}</span>
                </div>
                <div>
                  <span className="font-bold">操作时间: </span>
                  <span>{dayjs(currentLog.operTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold">请求URL: </span>
                  <span>{currentLog.operUrl || '未知'}</span>
                </div>
                {currentLog.operParam && (
                  <div className="col-span-2">
                    <span className="font-bold">请求参数: </span>
                    <div className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                      <pre className="text-xs">{currentLog.operParam}</pre>
                    </div>
                  </div>
                )}
                {currentLog.jsonResult && (
                  <div className="col-span-2">
                    <span className="font-bold">返回参数: </span>
                    <div className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                      <pre className="text-xs">{currentLog.jsonResult}</pre>
                    </div>
                  </div>
                )}
                {currentLog.errorMsg && (
                  <div className="col-span-2">
                    <span className="font-bold">错误消息: </span>
                    <div className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto text-red-500">
                      <pre className="text-xs">{currentLog.errorMsg}</pre>
                    </div>
                  </div>
                )}
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OperLogPage;