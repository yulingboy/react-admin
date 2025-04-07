import { request } from '@/utils/http';

// 登录请求参数接口
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar: string;
  status: number;
  roleId: number;
  }
// 登录响应数据接口
export interface LoginResult {
  token: string;
  user: UserInfo; // 用户信息
  // 可以根据实际后端返回数据扩展
}

/**
 * 用户登录
 * @param data 登录信息
 * @returns 登录结果，包含token等信息
 */
export function login(data: LoginParams) {
  return request.post<LoginResult>('/api/auth/login', data);
}
