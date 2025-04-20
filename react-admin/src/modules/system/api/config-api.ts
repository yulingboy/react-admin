import request from '@/utils/http';
import { Config, ConfigListParams, ConfigFormData, ConfigListResult } from '@/modules/system/types/config';

// 分页获取配置列表
export const getConfigList = (params: ConfigListParams) => {
  return request.get<ConfigListResult>('/api/configs/list', { params });
};

// 获取配置详情
export const getConfigDetail = (id: number) => {
  return request.get<Config>('/api/configs/detail', { params: { id } });
};

// 创建配置
export const createConfig = (data: ConfigFormData) => {
  return request.post<Config>('/api/configs/add', data);
};

// 更新配置
export const updateConfig = (data: ConfigFormData) => {
  return request.put<Config>('/api/configs/update', data);
};

// 删除配置
export const deleteConfig = (id: number) => {
  return request.delete<boolean>('/api/configs/delete', { params: { id } });
};

// 批量删除配置
export const batchDeleteConfigs = (ids: number[]) => {
  return request.delete<boolean>('/api/configs/deleteBatch', { data: { ids } });
};

// 获取配置分组选项
export const getConfigGroups = () => {
  return request.get<string[]>('/api/configs/groups');
};

// 获取配置值
export const getConfigValue = (key: string) => {
  return request.get<any>('/api/configs/value', { params: { key } });
};