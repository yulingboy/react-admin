import { useState, useRef } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { getRoleList, deleteRole } from '@/api/role';
import { Role, RoleListParams } from '@/types/role';
import { formatTableData } from '@/utils/tableHelper';

export const useRoleManage = () => {
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef<ActionType | null>(null);

  // 添加角色
  const handleAddRole = () => {
    setCurrentRole(undefined);
    setIsEdit(false);
    setFormModalVisible(true);
  };

  // 编辑角色
  const handleEditRole = (record: Role) => {
    setCurrentRole(record);
    setIsEdit(true);
    setFormModalVisible(true);
  };

  // 删除角色
  const handleDeleteRole = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('角色删除成功');
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除角色失败', error);
    }
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setFormModalVisible(false);
    tableRef.current?.reload();
  };

  // 加载角色列表数据
  const loadRoleList = async (params: RoleListParams) => {
    const response = await getRoleList(params);
    return formatTableData<Role>(response);
  };

  return {
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
  };
};