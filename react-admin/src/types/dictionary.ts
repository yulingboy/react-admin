// 字典类型定义
export interface Dictionary {
  id: number;
  name: string;
  code: string;
  description?: string;
  isSystem: string; // 0: 普通字典, 1: 系统内置
  createdAt?: string;
  updatedAt?: string;
}

// 字典项类型定义，与后端返回数据结构匹配
export interface DictionaryItem {
  id: number;
  dictionaryId: number;
  code: string;
  value: string;
  label: string;
  color?: string; // 新增字段：颜色值
  extra?: any; // 添加extra字段
  sort: number;
  status: string; // 修改为数字类型：1表示正常，0表示停用
  createdAt?: string;
  updatedAt?: string;
}

// 字典分页参数
export interface DictionaryQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
}

// 字典分页响应
export interface DictionaryListResponse {
  list: Dictionary[];
  total: number;
  page: number;
  pageSize: number;
}

// 添加字典请求参数
export interface AddDictionaryParams {
  name: string;
  code: string;
  description?: string;
}

// 更新字典请求参数
export interface UpdateDictionaryParams {
  id: number;
  name?: string;
  code?: string;
  description?: string;
}

// 添加字典项请求参数
export interface AddDictionaryItemParams {
  dictionaryId: number;
  label: string;
  value: string;
  color?: string; // 添加color字段
  code?: string; // 添加code字段
  sort?: number;
  status?: string; // 修改为数字类型
  extra?: any; // 添加extra字段
}

// 更新字典项请求参数
export interface UpdateDictionaryItemParams {
  id: number;
  dictionaryId?: number;
  label?: string;
  value?: string;
  color?: string; // 添加color字段
  code?: string; // 添加code字段
  sort?: number;
  status?: string; // 修改为数字类型
  extra?: any; // 添加extra字段
}