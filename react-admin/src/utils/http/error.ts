import { message } from '@/hooks/useMessage';
import { AxiosError } from 'axios';

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

// 处理业务错误
export const handleBusinessError = (code: number, errorMessage: string, showMessage: boolean = true): ApiError => {
  const msg = errorMessage || '未知错误';
  console.error(`业务错误(${code}): ${msg}`);

  if (showMessage) {
    message.error(msg);

    // 401: 未登录或token过期
    if (code === 401) {
      console.warn('登录已过期，请重新登录');
      message.warning('登录已过期，请重新登录');
      // 可以在这里调用登出函数，比如: logout()
    }
  }

  return new ApiError(msg, code);
};

// 处理HTTP错误
export const handleHttpError = (error: AxiosError, showMessage: boolean = true): AxiosError => {
  console.error('响应错误:', error);

  if (showMessage && error.response) {
    const status = error.response.status;
    if (status === 401) {
      console.warn('未授权，请登录');
      message.warning('未授权，请登录');
    } else if (status === 403) {
      console.warn('禁止访问');
      message.error('禁止访问该资源');
    } else if (status === 404) {
      console.warn('请求的资源不存在');
      message.error('请求的资源不存在');
    } else if (status === 500) {
      console.warn('服务器错误');
      message.error('服务器错误，请稍后重试');
    } else {
      message.error(`请求失败(${status})`);
    }
  } else if (showMessage && error.request) {
    console.warn('请求超时或网络错误');
    message.error('网络异常，请检查您的网络连接');
  } else if (showMessage) {
    message.error('请求配置错误');
  }

  return error;
};
