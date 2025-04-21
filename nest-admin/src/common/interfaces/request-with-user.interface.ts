/**
 * 用户请求对象接口扩展
 * 为Express请求对象扩展用户属性，用于获取当前登录用户信息
 */
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: number;
    username: string;
    email?: string;
    roleId?: number;
    [key: string]: any;
  };
}