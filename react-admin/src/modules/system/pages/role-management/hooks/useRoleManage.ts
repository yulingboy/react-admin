import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { formatTableData } from '@/utils/tableHelper';
import { Role, RoleListParams } from '@/modules/system/types/role';
import { deleteRole, getRoleList } from '@/modules/system/api/role-api';

export const useRoleManage = () => {
  // 表单模态框状态
  const [formVisible, setFormVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef<ActionType | null>(null);

  // 添加角色
  const handleAddRole = useCallback(() => {
    setCurrentRole(undefined);
    setIsEdit(false);
    setFormVisible(true);
  }, []);

  // 编辑角色
  const handleEditRole = useCallback((record: Role) => {
    setCurrentRole(record);
    setIsEdit(true);
    setFormVisible(true);
  }, []);

  // 删除角色
  const handleDeleteRole = useCallback(async (id: number) => {
    try {
      await deleteRole(id);
      message.success('角色删除成功');
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除角色失败', error);
    }
  }, []);

  // 表单提交成功回调
  const handleFormSuccess = useCallback(() => {
    setFormVisible(false);
    tableRef.current?.reload();
  }, []);

  // 加载角色列表数据
  const loadRoleList = useCallback(async (params: RoleListParams) => {
    const response = await getRoleList(params);
    return formatTableData<Role>(response);
  }, []);

  // 封装表单模态框属性
  const formModalProps = {
    open: formVisible,
    onCancel: () => setFormVisible(false),
    onSuccess: handleFormSuccess,
    initialValues: currentRole && {
      id: currentRole.id,
      name: currentRole.name,
      key: currentRole.key,
      description: currentRole.description,
      status: currentRole.status
    },
    isEdit: isEdit
  };

  return {
    tableRef,
    formModalProps,
    loadRoleList,
    handleAddRole,
    handleEditRole,
    handleDeleteRole
  };
};
