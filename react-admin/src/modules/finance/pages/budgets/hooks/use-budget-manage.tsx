import { useState, useRef } from 'react';
import { message } from 'antd';
import { ActionType } from '@ant-design/pro-components';
import { Budget, BudgetQueryParams } from '@/modules/finance/types';
import { getBudgetList, createBudget, updateBudget, deleteBudget } from '@/api/finance/budget';

/**
 * 预算管理业务逻辑钩子
 * 封装预算管理相关的状态和操作
 */
export const useBudgetManage = () => {
  // 表格操作引用
  const tableRef = useRef<ActionType>();
  
  // 表单模态框状态
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  /**
   * 加载预算列表数据
   * @param params 查询参数
   */
  const loadBudgetList = async (params: BudgetQueryParams) => {
    try {
      const { current, pageSize, ...restParams } = params;
      const response = await getBudgetList({
        page: current || 1,
        pageSize: pageSize || 10,
        ...restParams
      });
      
      return {
        data: response.data.items,
        total: response.data.total,
        success: true,
      };
    } catch (error) {
      console.error('获取预算列表失败:', error);
      message.error('获取预算列表失败');
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  /**
   * 新增预算处理函数
   */
  const handleAddBudget = () => {
    setCurrentBudget(null);
    setFormModalVisible(true);
  };

  /**
   * 编辑预算处理函数
   * @param budget 要编辑的预算对象
   */
  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setFormModalVisible(true);
  };

  /**
   * 删除预算处理函数
   * @param id 预算ID
   */
  const handleDeleteBudget = async (id: number) => {
    try {
      await deleteBudget(id);
      message.success('删除预算成功');
      // 刷新表格数据
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除预算失败:', error);
      message.error('删除预算失败');
    }
  };

  /**
   * 表单提交处理函数
   * @param values 表单值
   */
  const handleFormSubmit = async (values: Partial<Budget>) => {
    setConfirmLoading(true);
    try {
      if (currentBudget) {
        // 编辑模式
        await updateBudget(currentBudget.id, values);
        message.success('更新预算成功');
      } else {
        // 新增模式
        await createBudget(values);
        message.success('新增预算成功');
      }
      // 关闭模态框并刷新表格
      setFormModalVisible(false);
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存预算失败:', error);
      message.error('保存预算失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  /**
   * 关闭表单模态框
   */
  const handleFormCancel = () => {
    setFormModalVisible(false);
  };

  // 表单模态框属性
  const formModalProps = {
    visible: formModalVisible,
    confirmLoading,
    budget: currentBudget,
    onSubmit: handleFormSubmit,
    onCancel: handleFormCancel,
  };

  return {
    tableRef,
    formModalProps,
    loadBudgetList,
    handleAddBudget,
    handleEditBudget,
    handleDeleteBudget,
  };
};