export interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  keyword?: string;
  type?: string;
  current: number;
  pageSize: number;
}

export interface NotificationFormData {
  id?: number;
  title: string;
  content: string;
  type: string;
}

export interface NotificationListResult {
  items: Notification[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}