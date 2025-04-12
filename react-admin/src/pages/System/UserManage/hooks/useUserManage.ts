import { useState, useRef } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { getUserList, deleteUser } from '@/api/user';
import { getRoleOptions } from '@/api/role';
import { User, UserListParams } from '@/types/user';
import { formatTableData } from '@/utils/tableHelper';

export const useUserManage = () => {
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
  const tableRef = useRef<ActionType | null>(null);

  // 加载角色选项
  const loadRoleOptions = async () => {
    const data = await getRoleOptions();
    setRoleOptions(data.map(item => ({
      label: item.name,
      value: item.id
    })));
  };

  // 添加用户
  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsEdit(false);
    setFormModalVisible(true);
  };

  // 编辑用户
  const handleEditUser = (record: User) => {
    setCurrentUser(record);
    setIsEdit(true);
    setFormModalVisible(true);
  };

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('用户删除成功');
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除用户失败', error);
    }
  };

  // 表单提交成功回调
  const handleFormSuccess = () => {
    setFormModalVisible(false);
    tableRef.current?.reload();
  };

  // 加载用户列表数据
  const loadUserList = async (params: UserListParams) => {
    const response = await getUserList(params);
    return formatTableData<User>(response);
  };

  return {
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
  };
};