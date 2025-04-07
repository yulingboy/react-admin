import { AxiosRequestConfig } from 'axios';

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
}
