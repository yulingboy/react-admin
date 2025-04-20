import request from '@/utils/http';
import { PaginationParams } from '@/types/pagination';

/**
 * 查询登录日志列表
 */
export function getLoginLogs(params: PaginationParams & {
  username?: string;
  ipAddress?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  return request.get('/api/loginLogs/list', { params });
}

/**
 * 获取登录日志详情
 */
export function getLoginLogDetail(id: number) {
  return request.get('/api/loginLogs/detail', { params: { id } });
}

/**
 * 批量删除登录日志
 */
export function batchDeleteLoginLogs(ids: number[]) {
  return request.delete('/api/loginLogs/deleteBatch', { data: { ids } });
}

/**
 * 清空登录日志
 */
export function clearLoginLogs() {
  return request.delete('/api/loginLogs/clear');
}