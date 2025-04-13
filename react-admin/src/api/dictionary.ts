import request from '@/utils/http';
import {
  Dictionary,
  DictionaryItem,
  DictionaryQueryParams,
  DictionaryListResponse,
  AddDictionaryParams,
  UpdateDictionaryParams,
  AddDictionaryItemParams,
  UpdateDictionaryItemParams
} from '@/types/dictionary';

// 字典管理接口

/**
 * 获取字典列表（分页）
 * @param params 查询参数
 */
export const getDictionaryList = (params: DictionaryQueryParams) => {
  return request.get<DictionaryListResponse>('/api/dictionaries/list', { params });
};

/**
 * 获取字典详情
 * @param id 字典ID
 */
export const getDictionaryDetail = (id: number) => {
  return request.get<Dictionary>('/api/dictionaries/detail', { params: { id } });
};

/**
 * 通过编码获取字典
 * @param code 字典编码
 */
export const getDictionaryByCode = (code: string) => {
  return request.get<Dictionary>('/api/dictionaries/getByCode', { params: { code } });
};

/**
 * 创建字典
 * @param data 字典数据
 */
export const createDictionary = (data: AddDictionaryParams) => {
  return request.post<Dictionary>('/api/dictionaries/add', data);
};

/**
 * 更新字典
 * @param data 字典数据
 */
export const updateDictionary = (data: UpdateDictionaryParams) => {
  return request.put<Dictionary>('/api/dictionaries/update', data);
};

/**
 * 删除字典
 * @param id 字典ID
 */
export const deleteDictionary = (id: number) => {
  return request.delete<null>('/api/dictionaries/delete', { params: { id } });
};

/**
 * 批量删除字典
 * @param ids 字典ID数组
 */
export const batchDeleteDictionaries = (ids: number[]) => {
  const idsStr = ids.join(',');
  return request.delete<null>('/api/dictionaries/deleteBatch', { params: { ids: idsStr } });
};

/**
 * 获取所有字典类型
 * 返回所有可用的字典列表，用于下拉选择字典类型
 */
export const getAllDictionaries = () => {
  return request.get<Dictionary[]>('/api/dictionaries/all');
};

// 字典项管理接口

/**
 * 获取字典项列表
 * @param dictionaryId 字典ID
 */
export const getDictionaryItems = (dictionaryId: number) => {
  return request.get<DictionaryItem[]>('/api/dictionaries/items', { params: { dictionaryId } });
};

/**
 * 通过字典编码获取字典项列表
 * @param code 字典编码
 */
export const getDictionaryItemsByCode = (code: string) => {
  return request.get<DictionaryItem[]>('/api/dictionaries/itemsByCode', { params: { code } });
};

/**
 * 添加字典项
 * @param data 字典项数据
 */
export const addDictionaryItem = (data: AddDictionaryItemParams) => {
  return request.post<DictionaryItem>('/api/dictionaries/item/add', data);
};

/**
 * 更新字典项
 * @param data 字典项数据
 */
export const updateDictionaryItem = (data: UpdateDictionaryItemParams) => {
  return request.put<DictionaryItem>('/api/dictionaries/item/update', data);
};

/**
 * 删除字典项
 * @param id 字典项ID
 */
export const deleteDictionaryItem = (id: number) => {
  return request.delete<null>('/api/dictionaries/item/delete', { params: { id } });
};

/**
 * 批量删除字典项
 * @param ids 字典项ID数组
 */
export const batchDeleteDictionaryItems = (ids: number[]) => {
  const idsStr = ids.join(',');
  return request.delete<null>('/api/dictionaries/item/deleteBatch', { params: { ids: idsStr } });
};