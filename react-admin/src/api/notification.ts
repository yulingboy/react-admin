import request from '@/utils/http';
import { Notification, NotificationFormData, NotificationListParams, NotificationListResult } from '@/types/notification';

// 分页获取通知列表
export const getNotificationList = (params: NotificationListParams) => {
  return request.get<NotificationListResult>('/api/notifications/list', { params });
};

// 获取通知详情
export const getNotificationDetail = (id: number) => {
  return request.get<Notification>('/api/notifications/detail', { params: { id } });
};

// 创建通知
export const createNotification = (data: NotificationFormData) => {
  return request.post<Notification>('/api/notifications/add', data);
};

// 更新通知
export const updateNotification = (data: NotificationFormData) => {
  return request.put<Notification>('/api/notifications/update', data);
};

// 删除通知
export const deleteNotification = (id: number) => {
  return request.delete<boolean>('/api/notifications/delete', { params: { id } });
};

// 批量删除通知
export const batchDeleteNotifications = (ids: number[]) => {
  return request.delete<boolean>('/api/notifications/deleteBatch', { data: { ids } });
};