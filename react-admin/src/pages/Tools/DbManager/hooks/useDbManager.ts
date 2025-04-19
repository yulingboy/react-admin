import { useState, useRef } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { DatabaseConnection, DatabaseConnectionListParams } from '@/types/db-manager';
import { getDatabaseConnectionList, createDatabaseConnection, updateDatabaseConnection, deleteDatabaseConnection } from '@/api/db-manager';

export const useDbManager = () => {
  // 表格引用
  const tableRef = useRef<ActionType | null>(null);

  // 表单相关状态
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<Partial<DatabaseConnection> | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // 数据库连接详情抽屉状态
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);

  // 处理添加数据库连接
  const handleAddConnection = () => {
    setCurrentConnection(null);
    setIsEdit(false);
    setFormModalVisible(true);
  };

  // 处理编辑数据库连接
  const handleEditConnection = (record: DatabaseConnection) => {
    setCurrentConnection(record);
    setIsEdit(true);
    setFormModalVisible(true);
  };

  // 处理删除数据库连接
  const handleDeleteConnection = async (id: number) => {
    await deleteDatabaseConnection(id);
    message.success('删除成功');

    // 刷新表格
    tableRef.current?.reload();
  };

  // 处理连接到数据库
  const handleConnect = (record: DatabaseConnection) => {
    setSelectedConnection(record);
    setDrawerVisible(true);
  };

  // 处理表单提交成功
  const handleFormSuccess = async (values: Partial<DatabaseConnection>) => {
    if (isEdit && values.id) {
      // 编辑
      await updateDatabaseConnection(values.id, values);
      message.success('更新成功');
    } else {
      // 新增
      await createDatabaseConnection(values);
      message.success('创建成功');
    }

    // 关闭表单并刷新表格
    setFormModalVisible(false);
    tableRef.current?.reload();
  };

  // 关闭抽屉
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedConnection(null);
  };

  // 加载数据库连接列表
  const loadConnectionList = async (params: DatabaseConnectionListParams) => {
    const result = await getDatabaseConnectionList(params);

    return {
      data: result.list || [],
      success: true,
      total: result.total
    };
  };

  return {
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
  };
};
