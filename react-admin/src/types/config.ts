export interface Config {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: string;
  group?: string;
  sort: number;
  status: string; // 1: 启用, 0: 禁用
  isSystem: string; // 1: 系统内置, 0: 普通配置
  createdAt: string;
  updatedAt?: string;
}

export interface ConfigListParams {
  keyword?: string;
  group?: string;
  status?: string;
  isSystem?: string;
  current: number;
  pageSize: number;
}

export interface ConfigFormData {
  id?: number;
  key: string;
  value: string;
  description?: string;
  type?: string;
  group?: string;
  sort?: number;
  status?: string;
  isSystem?: string;
}

export interface ConfigListResult {
  items: Config[];
  meta: {
    total: number;
    totalPages: number | null;
    page: number;
    pageSize: number;
  };
}