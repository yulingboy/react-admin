import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Role, RoleListParams } from '@/types/role';
import { useRoleManage } from './hooks/useRoleManage';
import { getRoleColumns } from './components/RoleColumns';
import RoleFormModal from './components/RoleFormModal';

const RoleManage: React.FC = () => {
  const {
    formModalVisible,
    setFormModalVisible,
    currentRole,
    isEdit,
    tableRef,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleFormSuccess,
    loadRoleList
  } = useRoleManage();

  // 获取表格列配置
  const columns = getRoleColumns({
    handleEditRole,
    handleDeleteRole
  });

  return (
    <div>
      <ProTable<Role, RoleListParams>
        headerTitle="角色列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        cardBordered
        toolBarRender={() => [
          <Button 
            key="add" 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddRole}
          >
            新增角色
          </Button>,
        ]}
        request={loadRoleList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        columns={columns}
      />
      
      <RoleFormModal
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
        initialValues={currentRole ? {
          id: currentRole.id,
          name: currentRole.name,
          key: currentRole.key,
          description: currentRole.description,
          status: currentRole.status,
        } : undefined}
        isEdit={isEdit}
      />
    </div>
  );
};

export default RoleManage;
