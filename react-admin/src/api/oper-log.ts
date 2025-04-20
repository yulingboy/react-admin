import request from '@/utils/http';
import { PaginationParams } from '@/types/pagination';

/**
 * 查询操作日志列表
 */
export function getOperLogs(params: PaginationParams & {
  title?: string;
  operName?: string;
  businessType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  return request.get('/api/operLogs/list', { params });
}

/**
 * 获取操作日志详情
 */
export function getOperLogDetail(id: number) {
  return request.get('/api/operLogs/detail', { params: { id } });
}

/**
 * 批量删除操作日志
 */
export function batchDeleteOperLogs(ids: number[]) {
  return request.delete('/api/operLogs/deleteBatch', { data: { ids } });
}

/**
 * 清空操作日志
 */
export function clearOperLogs() {
  return request.delete('/api/operLogs/clear');
}