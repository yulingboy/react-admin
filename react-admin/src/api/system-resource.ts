import { request } from '@/utils/http';

// 获取最新系统资源数据
export const getLatestResourceData = () => {
  return request.get('/api/system-resource/latest');
};

// 获取历史系统资源数据
export const getHistoricalData = (hours = 24) => {
  return request.get(`/api/system-resource/historical?hours=${hours}`);
};

// 获取系统信息摘要
export const getSystemInfoSummary = () => {
  return request.get('/api/system-resource/system-info');
};