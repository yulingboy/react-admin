/**
 * 格式化时间戳为可读字符串
 * @param timestamp 时间戳或日期字符串
 * @returns 格式化后的时间字符串，如 "2025-04-20 13:45:30"
 */
export function formatTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化当前时间为可读字符串
 * @returns 格式化后的当前时间
 */
export function getCurrentFormattedTime(): string {
  return formatTime(new Date());
}

/**
 * 将秒转换为时分秒格式
 * @param seconds 秒数
 * @returns 格式化后的时间，如 "5小时32分钟12秒"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}小时`;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}分钟`;
  }
  
  result += `${remainingSeconds}秒`;
  
  return result;
}