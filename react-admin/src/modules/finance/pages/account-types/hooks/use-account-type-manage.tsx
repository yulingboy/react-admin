import { useRef, useState } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { AccountType, AccountTypeFormData, AccountTypeListResult, AccountTypeQueryParams } from '@/modules/finance/types';
import { createAccountType, getAccountTypeList, updateAccountType, deleteAccountType } from '@/modules/finance/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * 账户类型管理自定义钩子
 */
export const useAccountTypeManage = () => {
  const tableRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Partial<AccountType>>({});

  // 加载账户类型列表数据
  const loadAccountTypeList = async (
    params: AccountTypeQueryParams & {
      pageSize?: number;
      current?: number;
    }
  ): Promise<AccountTypeListResult> => {
    const { current, pageSize, ...restParams } = params;
    try {
      const response = await getAccountTypeList({
        current: current || 1,
        pageSize: pageSize || 10,
        ...restParams,
      });
      return {
        data: response.items,
        success: true,
        total: response.meta.total,
      };
    } catch (error) {
      console.error('加载账户类型列表数据失败', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理添加账户类型
  const handleAddAccountType = () => {
    setCurrentRow({});
    setModalVisible(true);
  };

  // 处理编辑账户类型
  const handleEditAccountType = (record: AccountType) => {
    if (record.isSystem === '1') {
      message.warning('系统内置账户类型不可编辑');
      return;
    }
    setCurrentRow(record);
    setModalVisible(true);
  };

  // 处理删除账户类型
  const handleDeleteAccountType = (id: number) => {
    // 确认删除
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该账户类型吗？删除后不可恢复，关联的账户可能会受到影响。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAccountType(id);
          message.success('删除成功');
          // 刷新表格
          tableRef.current?.reload();
        } catch (error) {
          console.error('删除账户类型失败', error);
        }
      },
    });
  };

  // 处理表单提交
  const handleSubmit = async (values: AccountTypeFormData) => {
    setModalLoading(true);
    try {
      if (values.id) {
        // 更新
        await updateAccountType(values);
        message.success('更新成功');
      } else {
        // 创建
        await createAccountType(values);
        message.success('创建成功');
      }
      // 关闭弹窗
      setModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存账户类型失败', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setModalVisible(false);
    setCurrentRow({});
  };

  // 表单弹窗属性
  const formModalProps = {
    visible: modalVisible,
    loading: modalLoading,
    values: currentRow,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };

  return {
    tableRef,
    formModalProps,
    loadAccountTypeList,
    handleAddAccountType,
    handleEditAccountType,
    handleDeleteAccountType,
  };
};