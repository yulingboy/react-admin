import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  HttpRequestConfig, 
  HttpResponse, 
  IHttpClient,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from './interfaces/http-client.interface';

/**
 * 基于Axios实现的HTTP客户端服务
 * 用于调用第三方API接口
 */
@Injectable()
export class HttpClientService implements IHttpClient {
  private axiosInstance: AxiosInstance;
  private readonly logger = new Logger(HttpClientService.name);
  
  constructor() {
    // 创建axios实例
    this.axiosInstance = axios.create({
      timeout: 10000, // 默认超时时间10秒
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 添加默认请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('请求发送失败', error);
        return Promise.reject(error);
      }
    );
    
    // 添加默认响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`响应成功: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(`响应错误: ${error.response.status} - ${error.response.config.method?.toUpperCase()} ${error.response.config.url}`);
        } else if (error.request) {
          this.logger.error('未收到响应', error.request);
        } else {
          this.logger.error('请求配置错误', error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 转换请求配置
   * @param config HTTP请求配置
   * @returns Axios请求配置
   */
  private transformRequestConfig(config?: HttpRequestConfig): AxiosRequestConfig {
    if (!config) return {};
    
    const { headers, params, timeout, withCredentials, ...rest } = config;
    return {
      headers,
      params,
      timeout,
      withCredentials,
      ...rest,
    };
  }
  
  /**
   * 转换响应结果
   * @param response Axios响应
   * @returns HTTP响应
   */
  private transformResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      rawResponse: response,
    };
  }
  
  /**
   * 发送GET请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async get<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, this.transformRequestConfig(config));
      return this.transformResponse<T>(response);
    } catch (error) {
      this.logger.error(`GET请求失败: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async post<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, this.transformRequestConfig(config));
      return this.transformResponse<T>(response);
    } catch (error) {
      this.logger.error(`POST请求失败: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async put<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, this.transformRequestConfig(config));
      return this.transformResponse<T>(response);
    } catch (error) {
      this.logger.error(`PUT请求失败: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async delete<T = any>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, this.transformRequestConfig(config));
      return this.transformResponse<T>(response);
    } catch (error) {
      this.logger.error(`DELETE请求失败: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * 发送PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise<HttpResponse<T>>
   */
  async patch<T = any>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, this.transformRequestConfig(config));
      return this.transformResponse<T>(response);
    } catch (error) {
      this.logger.error(`PATCH请求失败: ${url}`, error);
      throw error;
    }
  }
  
  /**
   * 添加请求拦截器
   * @param interceptor 请求拦截器函数
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const transformedConfig = await interceptor(config as HttpRequestConfig);
        return transformedConfig as InternalAxiosRequestConfig;
      },
      (error) => Promise.reject(error)
    );
  }
  
  /**
   * 添加响应拦截器
   * @param interceptor 响应拦截器函数
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.axiosInstance.interceptors.response.use(
      async (response) => {
        const transformedResponse = await interceptor(this.transformResponse(response));
        return response;
      },
      (error) => Promise.reject(error)
    );
  }
  
  /**
   * 添加错误拦截器
   * @param interceptor 错误拦截器函数
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        return Promise.reject(await interceptor(error));
      }
    );
  }
}