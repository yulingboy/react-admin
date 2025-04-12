import React, { useEffect } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useUserManage } from './hooks/useUserManage';
import UserFormModal from './components/UserFormModal';
import { getUserColumns } from './components/UserColumns';
import { User, UserListParams } from '@/types/user';

const UserManage: React.FC = () => {
  const {
    formModalVisible,
    setFormModalVisible,
    currentUser,
    isEdit,
    roleOptions,
    tableRef,
    loadRoleOptions,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleFormSuccess,
    loadUserList
  } = useUserManage();

  // 加载角色选项
  useEffect(() => {
    loadRoleOptions();
  }, []);

  // 获取表格列配置
  const columns = getUserColumns({
    handleEditUser,
    handleDeleteUser
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button 
      key="add" 
      type="primary" 
      icon={<PlusOutlined />}
      onClick={handleAddUser}
    >
      新增用户
    </Button>
  ];

  return (
    <div>
      <ProTable<User, UserListParams>
        headerTitle="用户列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={toolBarRender}
        request={loadUserList}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 10,
        }}
        columns={columns}
        cardBordered
      />
      
      <UserFormModal
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        onSuccess={handleFormSuccess}
        initialValues={currentUser ? {
          id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email,
          status: currentUser.status,
          roleId: currentUser.roleId
        } : undefined}
        isEdit={isEdit}
        roleOptions={roleOptions}
      />
    </div>
  );
};

export default UserManage;