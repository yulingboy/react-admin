import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { local, STORAGE_KEYS } from '../storage';
import { handleHttpError } from './error';
import { BaseResponse, CustomRequestConfig, ResponseCode } from './types';
import { message } from '@/hooks/useMessage';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 从环境变量获取基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = local.get<string>(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse): Promise<any> => {
    const res = response.data as BaseResponse;
    const config = response.config as CustomRequestConfig;
    
    // 自定义配置选项
    const showErrorMessage = config.showErrorMessage !== false;
    
    // 处理成功响应
    const isSuccess = !res.code || res.code === ResponseCode.SUCCESS;
    
    if (isSuccess) {
      // 统一返回数据部分，不再根据withFullResponse区分
      return Promise.resolve(res.data);
    }
    console.error('请求失败:', res.message || '未知错误');
    console.log('请求失败的响应:', res);
    console.log('showErrorMessage', showErrorMessage)
    
    // 处理业务错误，当code不等于200时，直接提示message信息
    if (showErrorMessage && res.message) {
      message.error(res.message);
      
      // 特殊处理401状态码（未授权）
      if (res.code === ResponseCode.UNAUTHORIZED) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          message.warning('登录已过期，请重新登录');
          sessionStorage.setItem('redirectPath', currentPath);
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(res);
  },
  error => {
    console.error('响应错误:', error);
    const config = error.config as CustomRequestConfig;
    const showErrorMessage = config?.showErrorMessage !== false;
    
    if (showErrorMessage) {
      handleHttpError(error, true);
    }
    
    return Promise.reject(error);
  }
);

export default service;
