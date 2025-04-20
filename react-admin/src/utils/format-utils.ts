/**
 * 将字节数转换为可读的文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的文件大小字符串，如 "1.5 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化数字，添加千位分隔符
 * @param num 需要格式化的数字
 * @returns 格式化后的字符串，如 "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

/**
 * 格式化百分比
 * @param value 百分比值 (0-100)
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的百分比字符串，如 "42.50%"
 */
export function formatPercentage(value: number, decimals = 2): string {
  return value.toFixed(decimals) + '%';
}