import { AxiosRequestConfig } from 'axios';

// 响应状态码枚举
export enum ResponseCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

// 定义响应数据的基本类型
export interface BaseResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 定义请求参数的类型
export interface RequestParams {
  [key: string]: any;
}

// 扩展 AxiosRequestConfig，添加自定义配置
export interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过默认的错误处理
  showErrorMessage?: boolean; // 是否显示错误消息
  withFullResponse?: boolean; // 是否返回完整响应而不是仅返回data
}

// API错误类型
export class ApiError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number = -1, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}
