import { request } from '@/utils/http';
import { ScheduleJob } from '@/types/schedule-job';

const BASE_URL = '/api/system/schedule-job';

/**
 * 获取定时任务列表
 */
export async function getScheduleJobs(params: any) {
  return request.get(BASE_URL, { params });
}

/**
 * 获取定时任务详情
 */
export async function getScheduleJobById(id: number) {
  return request.get(`${BASE_URL}/${id}`);
}

/**
 * 创建定时任务
 */
export async function createScheduleJob(data: Omit<ScheduleJob, 'id' | 'createdAt' | 'updatedAt'>) {
  return request.post(BASE_URL, data);
}

/**
 * 更新定时任务
 */
export async function updateScheduleJob(data: ScheduleJob) {
  return request.put(BASE_URL, data);
}

/**
 * 删除定时任务
 */
export async function deleteScheduleJob(id: number) {
  return request.delete(`${BASE_URL}/${id}`);
}

/**
 * 启动定时任务
 */
export async function startScheduleJob(id: number) {
  return request.put(`${BASE_URL}/${id}/start`);
}

/**
 * 停止定时任务
 */
export async function stopScheduleJob(id: number) {
  return request.put(`${BASE_URL}/${id}/stop`);
}

/**
 * 执行一次定时任务
 */
export async function runScheduleJobOnce(id: number) {
  return request.post(`${BASE_URL}/${id}/run-once`);
}

/**
 * 获取定时任务日志
 */
export async function getScheduleJobLogs(id: number, params: any) {
  return request.get(`${BASE_URL}/${id}/logs`, { params });
}

/**
 * 清空指定任务的日志
 */
export async function clearScheduleJobLogs(id: number) {
  return request.delete(`${BASE_URL}/${id}/logs`);
}

/**
 * 清空所有任务日志
 */
export async function clearAllScheduleJobLogs() {
  return request.delete(`${BASE_URL}/logs/clear-all`);
}