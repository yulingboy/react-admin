import { useState, useRef, useCallback, useEffect } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { formatTableData } from '@/utils/tableHelper';
import { User, UserListParams } from '@/modules/system/types/user';
import { getRoleOptions } from '@/modules/system/api/role-api';
import { deleteUser, getUserList } from '@/modules/system/api/user-api';

export const useDataList = () => {
  // 表单模态框状态
  const [formVisible, setFormVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<User | undefined>();
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: number }[]>([]);
  const tableRef = useRef<ActionType | null>(null);

  // 加载角色选项
  const loadRoleOptions = useCallback(async () => {
    const data = await getRoleOptions();

    setRoleOptions(data.map(item => ({ label: item.name, value: item.id })));
  }, []);

  // 初始化加载
  useEffect(() => {
    loadRoleOptions();
  }, [loadRoleOptions]);

  // 添加记录
  const handleAdd = useCallback(() => {
    setCurrentRecord(undefined);
    setFormVisible(true);
  }, []);

  // 编辑记录
  const handleEdit = (record: User) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  // 删除记录
  const handleDelete = useCallback(async (id: number) => {
    await deleteUser(id);
    tableRef.current?.reload();
  }, []);

  // 表单提交成功回调
  const handleFormSuccess = useCallback(() => {
    setFormVisible(false);
    tableRef.current?.reload();
  }, []);

  // 加载列表数据
  const loadData = useCallback(async (params: UserListParams) => {
    const response = await getUserList(params).catch(error => {
      console.error('加载数据失败', error);
      return { list: [], total: 0 };
    });
    return formatTableData<User>(response);
  }, []);

  // 封装表单模态框属性
  const formModalProps = {
    open: formVisible, // 修改 visible 为 open
    onCancel: () => setFormVisible(false),
    onSuccess: handleFormSuccess,
    initialValues: currentRecord && {
      id: currentRecord.id,
      username: currentRecord.username,
      email: currentRecord.email,
      name: currentRecord.name,
      status: currentRecord.status,
      roleId: currentRecord.roleId
    },
    isEdit: !!currentRecord?.id
  };

  return {
    tableRef,
    formModalProps,
    roleOptions,
    loadData,
    handleAdd,
    handleEdit,
    handleDelete,
    setFormVisible,
    formVisible,
    handleFormSuccess,
    currentRecord
  };
};
