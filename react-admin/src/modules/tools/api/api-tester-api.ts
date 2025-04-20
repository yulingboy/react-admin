import { request as http } from '@/utils/http';
import { ApiTestRequest, ApiTestResponse, ApiTestHistory, ApiTestHistoryQueryParams } from '@/modules/tools/types/api-tester';

/**
 * 发送接口测试请求
 * @param data 接口测试请求参数
 */
export function sendApiTestRequest(data: ApiTestRequest) {
  return http.post<ApiTestResponse>('/api/api-tester/test', data);
}

/**
 * 获取接口测试历史记录列表
 * @param params 查询参数
 */
export function getApiTestHistoryList(params: ApiTestHistoryQueryParams) {
  return http.get<{ total: number; list: ApiTestHistory[] }>('/api/api-tester/history', { params });
}

/**
 * 获取接口测试历史记录详情
 * @param id 历史记录ID
 */
export function getApiTestHistoryDetail(id: number) {
  return http.get<ApiTestHistory>(`/api/api-tester/history/${id}`);
}

/**
 * 保存接口测试历史记录
 * @param data 接口测试请求和响应数据
 */
export function saveApiTestHistory(data: Partial<ApiTestHistory>) {
  return http.post<ApiTestHistory>('/api/api-tester/history', data);
}

/**
 * 删除接口测试历史记录
 * @param id 历史记录ID
 */
export function deleteApiTestHistory(id: number) {
  return http.delete(`/api/api-tester/history/${id}`);
}

/**
 * 批量删除接口测试历史记录
 * @param ids 历史记录ID数组
 */
export function batchDeleteApiTestHistory(ids: number[]) {
  return http.delete('/api/api-tester/history/batch', { data: { ids } });
}

/**
 * 创建接口测试模板
 * @param data 接口测试请求模板数据
 */
export function createApiTestTemplate(data: Partial<ApiTestRequest>) {
  return http.post<ApiTestRequest>('/api/api-tester/template', data);
}

/**
 * 获取接口测试模板列表
 * @param params 查询参数
 */
export function getApiTestTemplateList(params?: { name?: string; page?: number; pageSize?: number }) {
  return http.get<{ total: number; list: ApiTestRequest[] }>('/api/api-tester/template', { params });
}

/**
 * 获取接口测试模板详情
 * @param id 模板ID
 */
export function getApiTestTemplateDetail(id: number) {
  return http.get<ApiTestRequest>(`/api/api-tester/template/${id}`);
}

/**
 * 更新接口测试模板
 * @param id 模板ID
 * @param data 模板数据
 */
export function updateApiTestTemplate(id: number, data: Partial<ApiTestRequest>) {
  return http.put<ApiTestRequest>(`/api/api-tester/template/${id}`, data);
}

/**
 * 删除接口测试模板
 * @param id 模板ID
 */
export function deleteApiTestTemplate(id: number) {
  return http.delete(`/api/api-tester/template/${id}`);
}
