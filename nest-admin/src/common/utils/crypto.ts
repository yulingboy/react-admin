/**
 * 加密工具类
 * 提供常用的加密、解密、编码等方法
 */
import * as crypto from 'crypto';

/**
 * MD5加密
 * @param data 需要加密的数据
 * @returns 加密后的字符串
 */
export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * SHA1加密
 * @param data 需要加密的数据
 * @returns 加密后的字符串
 */
export function sha1(data: string): string {
  return crypto.createHash('sha1').update(data).digest('hex');
}

/**
 * SHA256加密
 * @param data 需要加密的数据
 * @returns 加密后的字符串
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 生成随机密码
 * @param length 密码长度，默认为12
 * @param options 配置选项
 * @returns 随机密码
 */
export function generateRandomPassword(
  length: number = 12,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {},
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let chars = '';
  if (includeUppercase) chars += uppercaseChars;
  if (includeLowercase) chars += lowercaseChars;
  if (includeNumbers) chars += numberChars;
  if (includeSymbols) chars += symbolChars;

  // 至少需要一种字符集
  if (!chars) {
    chars = lowercaseChars + numberChars;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

/**
 * AES加密
 * @param data 需要加密的数据
 * @param key 密钥，长度必须是16、24或32字节
 * @param iv 初始化向量，长度必须是16字节
 * @returns 加密后的字符串（Base64编码）
 */
export function aesEncrypt(data: string, key: string, iv: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * AES解密
 * @param data 需要解密的数据（Base64编码）
 * @param key 密钥，长度必须是16、24或32字节
 * @param iv 初始化向量，长度必须是16字节
 * @returns 解密后的字符串
 */
export function aesDecrypt(data: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Base64编码
 * @param data 需要编码的数据
 * @returns 编码后的字符串
 */
export function base64Encode(data: string): string {
  return Buffer.from(data).toString('base64');
}

/**
 * Base64解码
 * @param data 需要解码的数据
 * @returns 解码后的字符串
 */
export function base64Decode(data: string): string {
  return Buffer.from(data, 'base64').toString();
}

/**
 * URL安全的Base64编码
 * @param data 需要编码的数据
 * @returns 编码后的字符串
 */
export function base64UrlEncode(data: string): string {
  return base64Encode(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * URL安全的Base64解码
 * @param data 需要解码的数据
 * @returns 解码后的字符串
 */
export function base64UrlDecode(data: string): string {
  // 将URL安全的字符替换回标准Base64字符
  data = data.replace(/-/g, '+').replace(/_/g, '/');
  
  // 添加回可能被移除的填充字符
  while (data.length % 4) {
    data += '=';
  }
  
  return base64Decode(data);
}

/**
 * HMAC-SHA256签名
 * @param data 需要签名的数据
 * @param key 密钥
 * @returns 签名结果
 */
export function hmacSha256(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}