import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Notification, NotificationListParams } from '@/modules/system/types/notification';
import { useNotificationManage } from './hooks/use-notification-manage';
import { getTableColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const NotificationManage: React.FC = () => {
  const { 
    tableRef, 
    formModalProps, 
    loadNotificationList, 
    handleAddNotification, 
    handleEditNotification, 
    handleDeleteNotification 
  } = useNotificationManage();

  // 获取表格列配置
  const columns = getTableColumns({
    handleEdit: handleEditNotification,
    handleDelete: handleDeleteNotification
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddNotification}>
      新增通知
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<Notification, NotificationListParams>
        headerTitle="通知列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadNotificationList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10
        }}
        columns={columns}
      />

      <FormModal {...formModalProps} />
    </div>
  );
};

export default NotificationManage;