/**
 * 日期工具类
 * 提供常用的日期操作方法
 */

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式
 * @returns 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
 * // 返回: "2025-04-24 15:30:45"
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  format = format.replace(/YYYY/g, year.toString());
  format = format.replace(/MM/g, month.toString().padStart(2, '0'));
  format = format.replace(/DD/g, day.toString().padStart(2, '0'));
  format = format.replace(/HH/g, hours.toString().padStart(2, '0'));
  format = format.replace(/mm/g, minutes.toString().padStart(2, '0'));
  format = format.replace(/ss/g, seconds.toString().padStart(2, '0'));

  return format;
}

/**
 * 获取当前日期
 * @param format 格式
 * @returns 当前日期字符串
 */
export function getCurrentDate(format: string = 'YYYY-MM-DD'): string {
  return formatDate(new Date(), format);
}

/**
 * 获取当前时间
 * @param format 格式
 * @returns 当前时间字符串
 */
export function getCurrentTime(format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return formatDate(new Date(), format);
}

/**
 * 日期字符串转日期对象
 * @param dateStr 日期字符串
 * @returns 日期对象
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * 计算两个日期之间的天数
 * @param start 开始日期
 * @param end 结束日期
 * @returns 天数
 */
export function daysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.round(diffTime / oneDay);
}

/**
 * 日期加减天数
 * @param date 日期
 * @param days 天数
 * @returns 新日期
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 日期加减月数
 * @param date 日期
 * @param months 月数
 * @returns 新日期
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 日期加减年数
 * @param date 日期
 * @param years 年数
 * @returns 新日期
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 获取指定日期所在月的第一天
 * @param date 日期
 * @returns 月初日期
 */
export function getFirstDayOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return result;
}

/**
 * 获取指定日期所在月的最后一天
 * @param date 日期
 * @returns 月末日期
 */
export function getLastDayOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  return result;
}

/**
 * 比较两个日期是否是同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否是同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 获取时间戳
 * @returns 时间戳（毫秒）
 */
export function getTimestamp(): number {
  return new Date().getTime();
}