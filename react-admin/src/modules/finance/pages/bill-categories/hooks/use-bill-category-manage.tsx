import { useRef, useState } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { BillCategory, BillCategoryFormData, BillCategoryListResult, BillCategoryQueryParams } from '@/modules/finance/types';
import { 
  getBillCategoryList, 
  createBillCategory, 
  updateBillCategory, 
  deleteBillCategory 
} from '@/modules/finance/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * 账单分类管理自定义钩子
 */
export const useBillCategoryManage = () => {
  const tableRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<BillCategory> & { categoryType?: string }>({});
  const [currentCategoryType, setCurrentCategoryType] = useState<string>('income');

  // 加载账单分类列表数据
  const loadBillCategoryList = async (
    params: BillCategoryQueryParams & {
      pageSize?: number;
      current?: number;
    }
  ): Promise<BillCategoryListResult> => {
    const { current, pageSize, ...restParams } = params;
    try {
      const response = await getBillCategoryList({
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
      console.error('加载账单分类列表数据失败', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理添加账单分类
  const handleAddBillCategory = () => {
    setCurrentCategory({ categoryType: currentCategoryType });
    setModalVisible(true);
  };

  // 处理编辑账单分类
  const handleEditBillCategory = (record: BillCategory) => {
    if (record.isSystem === '1') {
      message.warning('系统内置分类不可编辑');
      return;
    }
    setCurrentCategory({ ...record, categoryType: record.type });
    setModalVisible(true);
  };

  // 处理删除账单分类
  const handleDeleteBillCategory = (id: number) => {
    // 确认删除
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该账单分类吗？删除后不可恢复。如果分类下有账单，则不允许删除。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBillCategory(id);
          message.success('删除成功');
          // 刷新表格
          tableRef.current?.reload();
        } catch (error) {
          console.error('删除账单分类失败', error);
        }
      },
    });
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setCurrentCategoryType(key);
    // 切换标签页时刷新表格
    setTimeout(() => {
      tableRef.current?.reload();
    }, 0);
  };

  // 处理表单提交
  const handleSubmit = async (values: BillCategoryFormData) => {
    setModalLoading(true);
    try {
      if (values.id) {
        // 更新
        await updateBillCategory(values);
        message.success('更新成功');
      } else {
        // 创建
        await createBillCategory(values);
        message.success('创建成功');
      }
      // 关闭弹窗
      setModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存账单分类失败', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setModalVisible(false);
    setCurrentCategory({});
  };

  // 表单弹窗属性
  const formModalProps = {
    visible: modalVisible,
    loading: modalLoading,
    values: currentCategory,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };

  return {
    tableRef,
    currentCategoryType,
    formModalProps,
    loadBillCategoryList,
    handleAddBillCategory,
    handleEditBillCategory,
    handleDeleteBillCategory,
    handleTabChange,
  };
};