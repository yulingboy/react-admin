/**
 * 数据转换工具类
 * 提供常用的数据转换方法
 */

/**
 * 安全地将任意值转换为数字
 * @param value 需要转换的值
 * @param defaultValue 默认值
 * @returns 转换后的数字
 */
export function toNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 安全地将任意值转换为整数
 * @param value 需要转换的值
 * @param defaultValue 默认值
 * @returns 转换后的整数
 */
export function toInteger(value: any, defaultValue: number = 0): number {
  const num = toNumber(value, defaultValue);
  return Math.floor(num);
}

/**
 * 安全地将任意值转换为布尔值
 * @param value 需要转换的值
 * @param defaultValue 默认值
 * @returns 转换后的布尔值
 */
export function toBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'y';
  }
  
  return Boolean(value);
}

/**
 * 安全地将任意值转换为字符串
 * @param value 需要转换的值
 * @param defaultValue 默认值
 * @returns 转换后的字符串
 */
export function toString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return defaultValue;
    }
  }
  
  return String(value);
}

/**
 * 安全地将字符串转换为日期
 * @param value 需要转换的字符串
 * @param defaultValue 默认值
 * @returns 转换后的日期
 */
export function toDate(value: any, defaultValue: Date = new Date()): Date {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * 安全地将字符串转换为对象
 * @param value 需要转换的字符串
 * @param defaultValue 默认值
 * @returns 转换后的对象
 */
export function toObject<T = any>(value: any, defaultValue: T = {} as T): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }
  
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return defaultValue;
    }
  }
  
  return defaultValue;
}

/**
 * 安全地将字符串转换为数组
 * @param value 需要转换的字符串或对象
 * @param defaultValue 默认值
 * @returns 转换后的数组
 */
export function toArray<T = any>(value: any, defaultValue: T[] = []): T[] {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (Array.isArray(value)) {
    return value as T[];
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
      // 尝试处理逗号分隔的字符串
      return value.split(',').map(item => item.trim()) as unknown as T[];
    }
  }
  
  return defaultValue;
}