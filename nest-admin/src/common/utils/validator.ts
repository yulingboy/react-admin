/**
 * 校验工具类
 * 提供常用的数据验证方法
 */

/**
 * 是否为空值
 * @param value 需要验证的值
 * @returns 是否为空值
 */
export function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * 是否不为空值
 * @param value 需要验证的值
 * @returns 是否不为空值
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value);
}

/**
 * 是否为数字
 * @param value 需要验证的值
 * @returns 是否为数字
 */
export function isNumber(value: any): boolean {
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return !isNaN(Number(value));
  }
  return false;
}

/**
 * 是否为整数
 * @param value 需要验证的值
 * @returns 是否为整数
 */
export function isInteger(value: any): boolean {
  return isNumber(value) && Number.isInteger(Number(value));
}

/**
 * 是否为布尔值
 * @param value 需要验证的值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): boolean {
  return (
    typeof value === 'boolean' ||
    value === 'true' ||
    value === 'false' ||
    value === '0' ||
    value === '1'
  );
}

/**
 * 是否为对象
 * @param value 需要验证的值
 * @returns 是否为对象
 */
export function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 是否为数组
 * @param value 需要验证的值
 * @returns 是否为数组
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 是否为日期
 * @param value 需要验证的值
 * @returns 是否为日期
 */
export function isDate(value: any): boolean {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * 是否为邮箱地址
 * @param value 需要验证的值
 * @returns 是否为邮箱地址
 */
export function isEmail(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
}

/**
 * 是否为手机号码（中国大陆）
 * @param value 需要验证的值
 * @returns 是否为手机号码
 */
export function isMobilePhone(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value);
}

/**
 * 是否为URL
 * @param value 需要验证的值
 * @returns 是否为URL
 */
export function isUrl(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 是否为IP地址（v4或v6）
 * @param value 需要验证的值
 * @returns 是否为IP地址
 */
export function isIp(value: string): boolean {
  return isIpv4(value) || isIpv6(value);
}

/**
 * 是否为IPv4地址
 * @param value 需要验证的值
 * @returns 是否为IPv4地址
 */
export function isIpv4(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(value);
}

/**
 * 是否为IPv6地址
 * @param value 需要验证的值
 * @returns 是否为IPv6地址
 */
export function isIpv6(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const ipv6Regex = /^(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?=(?:[a-fA-F0-9]{0,4}:){0,7}[a-fA-F0-9]{0,4}$)(([0-9a-fA-F]{1,4}:){1,7}|:)((:[0-9a-fA-F]{1,4}){1,7}|:)|(?:[a-fA-F0-9]{1,4}:){7}:|:(:[a-fA-F0-9]{1,4}){7})$/;
  return ipv6Regex.test(value);
}

/**
 * 是否为身份证号码（中国大陆）
 * @param value 需要验证的值
 * @returns 是否为身份证号码
 */
export function isIdCard(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  // 支持15位和18位身份证号
  const idCardRegex = /(^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}(\d|X|x)$)|(^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}$)/;
  
  if (!idCardRegex.test(value)) {
    return false;
  }
  
  // 对于18位身份证，进一步校验最后一位校验码
  if (value.length === 18) {
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    let ai = 0;
    let wi = 0;
    
    for (let i = 0; i < 17; i++) {
      ai = parseInt(value.charAt(i));
      wi = factor[i];
      sum += ai * wi;
    }
    
    const last = parity[sum % 11];
    return last.toUpperCase() === value.charAt(17).toUpperCase();
  }
  
  return true;
}

/**
 * 是否为邮政编码（中国大陆）
 * @param value 需要验证的值
 * @returns 是否为邮政编码
 */
export function isPostalCode(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const postalCodeRegex = /^[1-9]\d{5}$/;
  return postalCodeRegex.test(value);
}

/**
 * 是否为中文字符
 * @param value 需要验证的值
 * @returns 是否为中文字符
 */
export function isChinese(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const chineseRegex = /^[\u4e00-\u9fa5]+$/;
  return chineseRegex.test(value);
}

/**
 * 是否包含中文字符
 * @param value 需要验证的值
 * @returns 是否包含中文字符
 */
export function hasChineseChar(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(value);
}

/**
 * 是否为安全密码
 * @param value 需要验证的值
 * @param options 配置选项
 * @returns 是否为安全密码
 */
export function isStrongPassword(
  value: string,
  options: {
    minLength?: number;
    minLowercase?: number;
    minUppercase?: number;
    minNumbers?: number;
    minSymbols?: number;
  } = {},
): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  const {
    minLength = 8,
    minLowercase = 1,
    minUppercase = 1,
    minNumbers = 1,
    minSymbols = 1,
  } = options;
  
  if (value.length < minLength) {
    return false;
  }
  
  const lowercaseCount = (value.match(/[a-z]/g) || []).length;
  const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
  const numbersCount = (value.match(/[0-9]/g) || []).length;
  const symbolsCount = (value.match(/[^a-zA-Z0-9]/g) || []).length;
  
  return (
    lowercaseCount >= minLowercase &&
    uppercaseCount >= minUppercase &&
    numbersCount >= minNumbers &&
    symbolsCount >= minSymbols
  );
}