import { compare, hash } from 'bcryptjs';
/**
 * 加密密码
 * @param password 密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

/**
 * 比较密码
 * @param password 密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}
