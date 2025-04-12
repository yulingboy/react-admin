// 用户实体类型
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  status: string;
  roleId: number;
  roleName?: string;
  isSystem: string; // 是否为系统内置用户：1 - 系统内置，0 - 非系统内置
  createdAt?: string;
  updatedAt?: string;
}

// 用户表单数据类型
export interface UserFormData {
  id?: number;
  username?: string;
  password?: string;
  email?: string;
  name?: string;
  avatar?: string;
  status?: string;
  roleId?: number;
}

// 用户列表查询参数
export interface UserListParams {
  username?: string;
  email?: string;
  status?: string;
  roleId?: number;
}

// 用户列表响应结果
export interface UserListResult {
  list: User[];
  total: number;
}
