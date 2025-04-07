import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { local, STORAGE_KEYS } from '../storage';
import { handleBusinessError, handleHttpError } from './error';
import { BaseResponse, CustomRequestConfig } from './types';

// 创建axios实例
const service: AxiosInstance = axios.create({
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做一些事情
    const token = local.get<string>(STORAGE_KEYS.TOKEN);
    if (token) {
      // 让每个请求携带自定义token
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse): Promise<any> => {
    const res = response.data as BaseResponse;
    const config = response.config as CustomRequestConfig;
    const showErrorMessage = config.showErrorMessage !== false;

    console.log('响应数据:', res);
    // 根据自定义错误码判断请求是否成功
    if (res.code && res.code !== 200) {
      if (!config.skipErrorHandler) {
        return Promise.reject(handleBusinessError(res.code, res.message, showErrorMessage));
      }
      return Promise.reject(res);
    } else {
      return Promise.resolve(res);
    }
  },
  error => {
    const config = error.config as CustomRequestConfig;
    const showErrorMessage = config?.showErrorMessage !== false;

    if (!config?.skipErrorHandler) {
      handleHttpError(error, showErrorMessage);
    }
    return Promise.reject(error);
  }
);

export default service;
