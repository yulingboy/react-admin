import { useRef, useState } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { BillTag, BillTagFormData, BillTagListResult, BillTagQueryParams } from '@/modules/finance/types';
import { 
  getBillTagList, 
  createBillTag, 
  updateBillTag, 
  deleteBillTag 
} from '@/modules/finance/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * 账单标签管理自定义钩子
 */
export const useBillTagManage = () => {
  const tableRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [currentTag, setCurrentTag] = useState<Partial<BillTag>>({});

  // 加载账单标签列表数据
  const loadBillTagList = async (
    params: BillTagQueryParams & {
      pageSize?: number;
      current?: number;
    }
  ): Promise<BillTagListResult> => {
    const { current, pageSize, ...restParams } = params;
    try {
      const response = await getBillTagList({
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
      console.error('加载账单标签列表数据失败', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理添加账单标签
  const handleAddBillTag = () => {
    setCurrentTag({});
    setModalVisible(true);
  };

  // 处理编辑账单标签
  const handleEditBillTag = (record: BillTag) => {
    setCurrentTag(record);
    setModalVisible(true);
  };

  // 处理删除账单标签
  const handleDeleteBillTag = (id: number) => {
    // 确认删除
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该账单标签吗？删除后不可恢复。如果标签已经被使用，则不允许删除。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBillTag(id);
          message.success('删除成功');
          // 刷新表格
          tableRef.current?.reload();
        } catch (error) {
          console.error('删除账单标签失败', error);
        }
      },
    });
  };

  // 处理表单提交
  const handleSubmit = async (values: BillTagFormData) => {
    setModalLoading(true);
    try {
      if (values.id) {
        // 更新
        await updateBillTag(values);
        message.success('更新成功');
      } else {
        // 创建
        await createBillTag(values);
        message.success('创建成功');
      }
      // 关闭弹窗
      setModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存账单标签失败', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setModalVisible(false);
    setCurrentTag({});
  };

  // 表单弹窗属性
  const formModalProps = {
    visible: modalVisible,
    loading: modalLoading,
    values: currentTag,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };

  return {
    tableRef,
    formModalProps,
    loadBillTagList,
    handleAddBillTag,
    handleEditBillTag,
    handleDeleteBillTag,
  };
};