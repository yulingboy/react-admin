import { useState, useRef, useCallback } from 'react';
import { ActionType } from '@ant-design/pro-components';
import { getNotificationList, deleteNotification } from '@/api/notification';
import { Notification, NotificationListParams } from '@/types/notification';
import { formatTableData } from '@/utils/tableHelper';
import { message } from '@/hooks/useMessage';

export const useNotificationManage = () => {
  // 状态定义
  const [formVisible, setFormVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const tableRef = useRef<ActionType | null>(null);

  // 添加通知
  const handleAddNotification = useCallback(() => {
    setCurrentNotification(undefined);
    setIsEdit(false);
    setFormVisible(true);
  }, []);

  // 编辑通知
  const handleEditNotification = useCallback((record: Notification) => {
    setCurrentNotification(record);
    setIsEdit(true);
    setFormVisible(true);
  }, []);

  // 删除通知
  const handleDeleteNotification = useCallback(async (id: number) => {
    try {
      await deleteNotification(id);
      message.success('通知删除成功');
      tableRef.current?.reload();
    } catch (error) {
      console.error('删除通知失败', error);
      message.error('删除通知失败');
    }
  }, []);

  // 表单提交成功回调
  const handleFormSuccess = useCallback(() => {
    setFormVisible(false);
    tableRef.current?.reload();
  }, []);

  // 加载通知列表数据
  const loadNotificationList = useCallback(async (params: NotificationListParams) => {
    try {
      const response = await getNotificationList(params);
      return formatTableData<Notification>(response);
    } catch (error) {
      console.error('加载通知列表失败', error);
      return { data: [], success: false, total: 0 };
    }
  }, []);

  // 封装表单模态框属性
  const formModalProps = {
    open: formVisible,
    onCancel: () => setFormVisible(false),
    onSuccess: handleFormSuccess,
    initialValues: currentNotification,
    isEdit
  };

  return {
    tableRef,
    formModalProps,
    loadNotificationList,
    handleAddNotification,
    handleEditNotification,
    handleDeleteNotification
  };
};