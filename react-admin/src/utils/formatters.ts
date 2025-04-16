/**
 * 格式化字节数据为可读格式
 * @param bytes 字节数
 * @param decimals 小数点位数
 * @returns 格式化后的字符串
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 格式化毫秒时间为可读格式
 * @param ms 毫秒
 * @returns 格式化后的字符串
 */
export const formatMilliseconds = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
};

/**
 * 格式化系统运行时间
 * @param uptime 运行秒数
 * @returns 格式化后的字符串
 */
export const formatUptime = (uptime: number): string => {
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);

  return parts.join(' ');
};

/**
 * 格式化百分比
 * @param value 数值 (0-1)
 * @param decimals 小数点位数
 * @returns 格式化后的字符串
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * 格式化日期时间
 * @param date 日期对象或日期字符串
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date);
  
  const replacers: Record<string, () => string | number> = {
    YYYY: () => d.getFullYear(),
    MM: () => String(d.getMonth() + 1).padStart(2, '0'),
    DD: () => String(d.getDate()).padStart(2, '0'),
    HH: () => String(d.getHours()).padStart(2, '0'),
    mm: () => String(d.getMinutes()).padStart(2, '0'),
    ss: () => String(d.getSeconds()).padStart(2, '0'),
  };

  let result = format;
  Object.entries(replacers).forEach(([token, fn]) => {
    result = result.replace(token, String(fn()));
  });

  return result;
};