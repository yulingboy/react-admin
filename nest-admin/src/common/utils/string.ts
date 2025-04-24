/**
 * 字符串工具类
 * 提供常用的字符串操作方法
 */

/**
 * 是否为空字符串
 * @param str 字符串
 * @returns 是否为空字符串
 */
export function isEmpty(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim() === '';
}

/**
 * 是否不为空字符串
 * @param str 字符串
 * @returns 是否不为空字符串
 */
export function isNotEmpty(str: string | null | undefined): boolean {
  return !isEmpty(str);
}

/**
 * 截取字符串
 * @param str 字符串
 * @param len 长度
 * @returns 截取后的字符串
 */
export function subString(str: string, len: number): string {
  if (isEmpty(str)) {
    return '';
  }
  if (str.length <= len) {
    return str;
  }
  return `${str.substring(0, len)}...`;
}

/**
 * 字符串格式化
 * @param template 模板字符串，如: "Hello, {0}! You are {1} years old."
 * @param args 参数列表
 * @returns 格式化后的字符串
 * @example
 * format("Hello, {0}! You are {1} years old.", "John", 25)
 * // 返回: "Hello, John! You are 25 years old."
 */
export function format(template: string, ...args: any[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写后的字符串
 */
export function capitalize(str: string): string {
  if (isEmpty(str)) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 驼峰转下划线
 * @param str 驼峰字符串
 * @returns 下划线字符串
 * @example
 * camelToUnderscore("helloWorld")
 * // 返回: "hello_world"
 */
export function camelToUnderscore(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 下划线转驼峰
 * @param str 下划线字符串
 * @returns 驼峰字符串
 * @example
 * underscoreToCamel("hello_world")
 * // 返回: "helloWorld"
 */
export function underscoreToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 生成指定长度的随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}