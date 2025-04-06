// 认证工具函数

/**
 * 封装token相关的操作，方便统一管理
 */

const TOKEN_KEY = 'token';

/**
 * 获取token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 设置token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 移除token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
