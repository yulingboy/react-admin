import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Role, RoleListParams } from '@/modules/auth/types/role';
import { useRoleManage } from './hooks/useRoleManage';
import { getRoleColumns } from './components/table-columns';
import FormModal from './components/form-modal';

const RoleManage: React.FC = () => {
  const { tableRef, formModalProps, loadRoleList, handleAddRole, handleEditRole, handleDeleteRole } = useRoleManage();

  // 获取表格列配置
  const columns = getRoleColumns({
    handleEditRole,
    handleDeleteRole
  });

  // 表格工具栏按钮
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
      新增角色
    </Button>
  ];

  return (
    <div className="page-container">
      <ProTable<Role, RoleListParams>
        headerTitle="角色列表"
        actionRef={tableRef}
        rowKey="id"
        search={{
          labelWidth: 'auto'
        }}
        cardBordered
        toolBarRender={toolBarRender}
        request={loadRoleList}
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

export default RoleManage;
