import request from '@/utils/http'; // 使用默认导出而不是命名导出
import { Role, RoleListParams, RoleFormData, RoleListResult, RoleOption } from '@/modules/auth/types/role';

// 分页获取角色列表
export const getRoleList = (params: RoleListParams) => {
  return request.get<RoleListResult>('/api/roles/list', { params });
};

// 获取所有角色选项
export const getRoleOptions = () => {
  return request.get<RoleOption[]>('/api/roles/options');
};

// 获取角色详情
export const getRoleDetail = (id: number) => {
  return request.get<Role>('/api/roles/detail', { params: { id } });
};

// 创建角色
export const createRole = (data: RoleFormData) => {
  return request.post<Role>('/api/roles/add', data);
};

// 更新角色
export const updateRole = (data: RoleFormData) => {
  return request.put<Role>('/api/roles/update', data);
};

// 删除角色
export const deleteRole = (id: number) => {
  return request.delete<boolean>('/api/roles/delete', { params: { id } });
};
