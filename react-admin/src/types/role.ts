export interface Role {
  id: number;
  name: string;
  key: string; // 新增 key 字段
  description: string;
  status: string; // 1: 启用, 0: 禁用
  isSystem: string; // 1: 系统内置, 0: 普通角色
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface RoleListParams {
  name?: string;
  key?: string; // 新增 key 字段用于查询
  status?: string;
  isSystem?: string;
  current: number;
  pageSize: number;
}

export interface RoleFormData {
  id?: number;
  name: string;
  key: string; // 新增 key 字段
  description?: string;
  status: string;
  isSystem?: string;
}

export interface RoleOption {
  id: number;
  name: string;
  description: string;
}

export interface RoleListResult {
  items: Role[];
  meta: {
    total: number;
    totalPages: number | null;
  };
}
