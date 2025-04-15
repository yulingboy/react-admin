import { message } from '@/hooks/useMessage';
import { AxiosError } from 'axios';
import { ApiError, ResponseCode } from './types';

/**
 * 处理业务错误
 * 处理来自后端的业务逻辑错误
 */
export const handleBusinessError = (code: number, errorMessage: string, showMessage: boolean = true): ApiError => {
  const msg = errorMessage || '未知错误';
  
  if (showMessage) {
    message.error(msg);
    
    // 处理特定的错误码
    if (code === ResponseCode.UNAUTHORIZED) {
      redirectToLogin();
    }
  }

  return new ApiError(msg, code);
};

/**
 * 处理HTTP错误
 * 处理HTTP请求过程中的错误
 */
export const handleHttpError = (error: AxiosError, showMessage: boolean = true): AxiosError => {
  if (!showMessage) return error;
  
  if (error.response) {
    const status = error.response.status;
    const errorMessage = (error.response.data as { message?: string })?.message || '未知错误';
    switch (status) {
      case ResponseCode.UNAUTHORIZED:
        redirectToLogin();
        break;
      case ResponseCode.FORBIDDEN:
        message.error('禁止访问该资源');
        break;
      case ResponseCode.NOT_FOUND:
        message.error('请求的资源不存在');
        break;
      case ResponseCode.SERVER_ERROR:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        message.error(errorMessage || `请求失败(${status})`);
    }
  } else if (error.request) {
    message.error('网络异常，请检查您的网络连接');
  } else {
    message.error('请求配置错误');
  }

  return error;
};

/**
 * 重定向到登录页
 */
function redirectToLogin() {
  message.warning('登录已过期，请重新登录');
  // 清除用户信息和token
  // 存储当前URL，登录后可以跳回
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    sessionStorage.setItem('redirectPath', currentPath);
    window.location.href = '/login';
  }
}
