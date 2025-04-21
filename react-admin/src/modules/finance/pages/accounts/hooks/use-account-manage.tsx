import { useRef, useState } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { Account, AccountFormData, AccountListResult, AccountQueryParams, AdjustBalanceData } from '@/modules/finance/types';
import { 
  getAccountList, 
  createAccount, 
  updateAccount, 
  deleteAccount, 
  adjustAccountBalance 
} from '@/modules/finance/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * 账户管理自定义钩子
 */
export const useAccountManage = () => {
  const tableRef = useRef<ActionType>();
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [formModalLoading, setFormModalLoading] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({});
  
  // 余额调整弹窗状态
  const [adjustModalVisible, setAdjustModalVisible] = useState<boolean>(false);
  const [adjustModalLoading, setAdjustModalLoading] = useState<boolean>(false);
  const [adjustAccount, setAdjustAccount] = useState<Partial<Account>>({});

  // 加载账户列表数据
  const loadAccountList = async (
    params: AccountQueryParams & {
      pageSize?: number;
      current?: number;
    }
  ): Promise<AccountListResult> => {
    const { current, pageSize, ...restParams } = params;
    try {
      const response = await getAccountList({
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
      console.error('加载账户列表数据失败', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理添加账户
  const handleAddAccount = () => {
    setCurrentAccount({});
    setFormModalVisible(true);
  };

  // 处理编辑账户
  const handleEditAccount = (record: Account) => {
    setCurrentAccount(record);
    setFormModalVisible(true);
  };

  // 处理调整余额
  const handleAdjustBalance = (record: Account) => {
    setAdjustAccount(record);
    setAdjustModalVisible(true);
  };

  // 处理删除账户
  const handleDeleteAccount = (id: number) => {
    // 确认删除
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该账户吗？删除后不可恢复，账户关联的账单不会被删除。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAccount(id);
          message.success('删除成功');
          // 刷新表格
          tableRef.current?.reload();
        } catch (error) {
          console.error('删除账户失败', error);
        }
      },
    });
  };

  // 处理表单提交
  const handleFormSubmit = async (values: AccountFormData) => {
    setFormModalLoading(true);
    try {
      if (values.id) {
        // 更新
        await updateAccount(values);
        message.success('更新成功');
      } else {
        // 创建
        await createAccount(values);
        message.success('创建成功');
      }
      // 关闭弹窗
      setFormModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存账户失败', error);
    } finally {
      setFormModalLoading(false);
    }
  };

  // 处理余额调整提交
  const handleAdjustSubmit = async (values: AdjustBalanceData) => {
    setAdjustModalLoading(true);
    try {
      await adjustAccountBalance(values);
      message.success('余额调整成功');
      // 关闭弹窗
      setAdjustModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('调整余额失败', error);
    } finally {
      setAdjustModalLoading(false);
    }
  };

  // 处理表单取消
  const handleFormCancel = () => {
    setFormModalVisible(false);
    setCurrentAccount({});
  };

  // 处理余额调整取消
  const handleAdjustCancel = () => {
    setAdjustModalVisible(false);
    setAdjustAccount({});
  };

  // 表单弹窗属性
  const formModalProps = {
    visible: formModalVisible,
    loading: formModalLoading,
    values: currentAccount,
    onSubmit: handleFormSubmit,
    onCancel: handleFormCancel,
  };

  // 余额调整弹窗属性
  const adjustBalanceModalProps = {
    visible: adjustModalVisible,
    loading: adjustModalLoading,
    account: adjustAccount,
    onSubmit: handleAdjustSubmit,
    onCancel: handleAdjustCancel,
  };

  return {
    tableRef,
    formModalProps,
    adjustBalanceModalProps,
    loadAccountList,
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
    handleAdjustBalance,
  };
};