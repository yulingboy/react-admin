/**
 * 定时任务状态
 */
export type ScheduleJobStatus = '0' | '1'; // 0-暂停 1-运行中

/**
 * 定时任务基础信息
 */
export interface ScheduleJob {
  id: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  cronExpression: string;
  misfirePolicy: string; // 1立即执行 2执行一次 3放弃执行
  concurrent: string; // 0允许 1禁止
  status: ScheduleJobStatus;
  isSystem: string; // 0-否 1-是
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 定时任务日志
 */
export interface ScheduleJobLog {
  id: number;
  jobId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  jobMessage?: string;
  status: string; // 0-失败 1-成功
  exceptionInfo?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

/**
 * 任务执行策略选项
 */
export const misfirePolicyOptions = [
  { label: '立即执行', value: '1' },
  { label: '执行一次', value: '2' },
  { label: '放弃执行', value: '3' },
];

/**
 * 是否并发执行选项
 */
export const concurrentOptions = [
  { label: '允许', value: '0' },
  { label: '禁止', value: '1' },
];

/**
 * 任务状态选项
 */
export const statusOptions = [
  { label: '暂停', value: '0' },
  { label: '运行中', value: '1' },
];

/**
 * 任务是否成功选项
 */
export const jobResultOptions = [
  { label: '失败', value: '0' },
  { label: '成功', value: '1' },
];