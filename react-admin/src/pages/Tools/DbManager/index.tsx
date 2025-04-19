import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { DatabaseConnection } from '@/types/db-manager';
import { useDbManager } from './hooks/useDbManager';
import getConnectionColumns from './components/connection-columns';
import ConnectionFormModal from './components/connection-form-modal';
import ConnectionDetailPanel from './components/connection-detail-panel';

const DbManager: React.FC = () => {
  const {
    tableRef,
    formModalVisible,
    setFormModalVisible,
    currentConnection,
    isEdit,
    drawerVisible,
    selectedConnection,
    handleAddConnection,
    handleEditConnection,
    handleDeleteConnection,
    handleConnect,
    handleFormSuccess,
    closeDrawer,
    loadConnectionList
  } = useDbManager();

  // 获取表格列配置
  const columns = getConnectionColumns({
    handleEditConnection,
    handleDeleteConnection,
    handleConnect
  });

  return (
    <div className="db-manager-container">
      <ProTable<DatabaseConnection>
        headerTitle={
          <div className="flex items-center">
            <DatabaseOutlined className="mr-2 text-lg" />
            数据库连接管理
          </div>
        }
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddConnection}>
            新增数据库连接
          </Button>
        ]}
        request={loadConnectionList}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showQuickJumper: true,
          defaultCurrent: 1,
          defaultPageSize: 10
        }}
        columns={columns}
        scroll={{ x: 'max-content' }}
        className="w-full"
      />

      {/* 数据库连接表单 */}
      <ConnectionFormModal
        title={isEdit ? '编辑数据库连接' : '新增数据库连接'}
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onSubmit={handleFormSuccess}
        initialValues={currentConnection || undefined}
      />

      {/* 数据库连接详情抽屉 */}
      <ConnectionDetailPanel visible={drawerVisible} connection={selectedConnection} onClose={closeDrawer} />
    </div>
  );
};

export default DbManager;
