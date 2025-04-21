/**
 * 账户类型相关API
 */
import request from '@/utils/http';
import { 
  AccountType, 
  AccountTypeFormData, 
  AccountTypeQueryParams, 
  AccountTypeListResult 
} from '../types';

/**
 * 分页获取账户类型列表
 * @param params 查询参数
 */
export const getAccountTypeList = (params: AccountTypeQueryParams) => {
  return request.get<AccountTypeListResult>('/api/finance/account-types/list', { params });
};

/**
 * 获取账户类型详情
 * @param id 账户类型ID
 */
export const getAccountTypeDetail = (id: number) => {
  return request.get<AccountType>('/api/finance/account-types/detail', { params: { id } });
};

/**
 * 获取所有账户类型选项
 */
export const getAccountTypeOptions = () => {
  return request.get<AccountType[]>('/api/finance/account-types/options');
};

/**
 * 创建账户类型
 * @param data 账户类型数据
 */
export const createAccountType = (data: AccountTypeFormData) => {
  return request.post<AccountType>('/api/finance/account-types/add', data);
};

/**
 * 更新账户类型
 * @param data 账户类型数据
 */
export const updateAccountType = (data: AccountTypeFormData) => {
  return request.put<AccountType>('/api/finance/account-types/update', data);
};

/**
 * 删除账户类型
 * @param id 账户类型ID
 */
export const deleteAccountType = (id: number) => {
  return request.delete('/api/finance/account-types/delete', { params: { id } });
};

/**
 * 批量删除账户类型
 * @param ids 账户类型ID数组
 */
export const batchDeleteAccountTypes = (ids: number[]) => {
  return request.delete('/api/finance/account-types/deleteBatch', { data: { ids } });
};