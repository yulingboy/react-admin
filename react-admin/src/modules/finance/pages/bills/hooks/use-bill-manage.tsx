import { useRef, useState } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { 
  Bill, 
  BillFormData, 
  BillListResult, 
  BillQueryParams,
  AdvancedFilterValues
} from '@/modules/finance/types';
import { 
  getBillList, 
  createBill, 
  updateBill, 
  deleteBill,
  exportBills
} from '@/modules/finance/api';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * 账单管理自定义钩子
 */
export const useBillManage = () => {
  const tableRef = useRef<ActionType>();
  // 账单类型（标签页）
  const [currentBillType, setCurrentBillType] = useState<string>('all');
  
  // 表单弹窗状态
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [formModalLoading, setFormModalLoading] = useState<boolean>(false);
  const [currentBill, setCurrentBill] = useState<Partial<Bill> & { billType?: string }>({});
  
  // 高级筛选抽屉状态
  const [filterDrawerVisible, setFilterDrawerVisible] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>({});

  // 加载账单列表数据
  const loadBillList = async (
    params: BillQueryParams & {
      pageSize?: number;
      current?: number;
    }
  ): Promise<BillListResult> => {
    const { current, pageSize, ...restParams } = params;
    try {
      // 合并高级筛选条件
      const queryParams = {
        current: current || 1,
        pageSize: pageSize || 10,
        ...restParams,
        ...advancedFilters
      };
      
      const response = await getBillList(queryParams);
      return {
        data: response.items,
        success: true,
        total: response.meta.total,
      };
    } catch (error) {
      console.error('加载账单列表数据失败', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 处理添加账单
  const handleAddBill = () => {
    setCurrentBill({ billType: currentBillType === 'all' ? 'expense' : currentBillType });
    setFormModalVisible(true);
  };

  // 处理编辑账单
  const handleEditBill = (record: Bill) => {
    setCurrentBill(record);
    setFormModalVisible(true);
  };

  // 处理删除账单
  const handleDeleteBill = (id: number) => {
    // 确认删除
    Modal.confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该账单记录吗？删除后不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBill(id);
          message.success('删除成功');
          // 刷新表格
          tableRef.current?.reload();
        } catch (error) {
          console.error('删除账单失败', error);
        }
      },
    });
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setCurrentBillType(key);
    // 切换标签页时刷新表格
    setTimeout(() => {
      tableRef.current?.reload();
    }, 0);
  };

  // 处理导出账单
  const handleExportBills = async () => {
    try {
      // 确认导出
      Modal.confirm({
        title: '导出确认',
        icon: <ExclamationCircleOutlined />,
        content: '确定要导出当前筛选条件下的账单数据吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            message.loading('正在导出账单数据...', 0);
            
            // 获取当前筛选条件
            const queryParams = {
              type: currentBillType,
              ...advancedFilters
            };
            
            await exportBills(queryParams);
            message.destroy();
            message.success('导出成功，请在系统通知中查看下载链接');
          } catch (error) {
            message.destroy();
            console.error('导出账单失败', error);
          }
        },
      });
    } catch (error) {
      console.error('导出账单失败', error);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values: BillFormData) => {
    setFormModalLoading(true);
    try {
      if (values.id) {
        // 更新
        await updateBill(values);
        message.success('更新成功');
      } else {
        // 创建
        await createBill(values);
        message.success('创建成功');
      }
      // 关闭弹窗
      setFormModalVisible(false);
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      console.error('保存账单失败', error);
    } finally {
      setFormModalLoading(false);
    }
  };

  // 处理表单取消
  const handleFormCancel = () => {
    setFormModalVisible(false);
    setCurrentBill({});
  };

  // 处理高级筛选
  const handleAdvancedFilter = (values: AdvancedFilterValues) => {
    setAdvancedFilters(values);
    setFilterDrawerVisible(false);
    // 应用筛选条件
    tableRef.current?.reload();
  };

  // 表单弹窗属性
  const formModalProps = {
    visible: formModalVisible,
    loading: formModalLoading,
    values: currentBill,
    onSubmit: handleFormSubmit,
    onCancel: handleFormCancel,
  };

  // 筛选抽屉属性
  const filterDrawerProps = {
    visible: filterDrawerVisible,
    initialValues: advancedFilters,
    onSubmit: handleAdvancedFilter,
    onClose: () => setFilterDrawerVisible(false),
    onOpen: () => setFilterDrawerVisible(true),
  };

  return {
    tableRef,
    currentBillType,
    formModalProps,
    filterDrawerProps,
    loadBillList,
    handleAddBill,
    handleEditBill,
    handleDeleteBill,
    handleTabChange,
    handleExportBills,
  };
};