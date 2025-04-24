/**
 * HTTP客户端接口定义
 * 定义了通用的HTTP请求方法和配置选项
 */

// HTTP请求方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// HTTP请求配置选项
export interface HttpRequestConfig {
  // 请求头
  headers?: Record<string, string>;
  // 查询参数
  params?: Record<string, any>;
  // 超时时间(毫秒)
  timeout?: number;
  // 是否携带凭证(cookies)
  withCredentials?: boolean;
  // 其他自定义配置
  [key: string]: any;
}

// HTTP响应接口
export interface HttpResponse<T = any> {
  // 响应数据
  data: T;
  // 状态码
  status: number;
  // 状态文本
  statusText: string;
  // 响应头
  headers: Record<string, string>;
  // 原始响应对象(可选)
  rawResponse?: any;
}

// 请求拦截器函数
export type RequestInterceptor = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;

// 响应拦截器函数
export type ResponseInterceptor = <T>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;

// 错误拦截器函数
export type ErrorInterceptor = (error: any) => any | Promise<any>;

// HTTP客户端接口
export interface IHttpClient {
  // 发送GET请求
  get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  
  // 发送POST请求
  post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  
  // 发送PUT请求
  put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  
  // 发送DELETE请求
  delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  
  // 发送PATCH请求
  patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  
  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  
  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
  
  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor): void;
}