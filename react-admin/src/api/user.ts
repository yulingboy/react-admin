import request from '@/utils/http';
import { User, UserListParams, UserFormData, UserListResult } from '@/types/user';

// 分页获取用户列表
export const getUserList = (params: UserListParams) => {
  return request.get<UserListResult>('/api/users/list', { params });
};

// 获取用户详情
export const getUserDetail = (id: number) => {
  return request.get<User>('/api/users/detail', { params: { id } });
};

// 创建用户
export const createUser = (data: UserFormData) => {
  return request.post<User>('/api/users/add', data);
};

// 更新用户
export const updateUser = (data: UserFormData) => {
  return request.put<User>('/api/users/update', data);
};

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete<boolean>('/api/users/delete', { params: { id } });
};

// 批量删除用户
export const batchDeleteUsers = (ids: number[]) => {
  return request.delete<boolean>('/api/users/deleteBatch', { data: { ids } });
};