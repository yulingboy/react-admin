import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiTestRequestDto } from '../dto';
import { ApiTesterBaseService } from './api-tester-base.service';

/**
 * API测试请求服务
 * 处理API测试的请求发送和响应处理
 */
@Injectable()
export class ApiTesterRequestService extends ApiTesterBaseService {
  /**
   * 发送API测试请求
   * @param data API测试请求参数
   * @param userId 当前用户ID
   * @returns API响应结果
   */
  async testApi(data: ApiTestRequestDto, userId?: number): Promise<any> {
    const startTime = Date.now();
    try {
      // 构建URL
      let url = data.url;
      let queryString = '';
      
      // 处理启用的参数
      if (data.params && data.params.length > 0) {
        const enabledParams = data.params.filter(param => param.enabled);
        if (enabledParams.length > 0) {
          queryString = enabledParams
            .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
            .join('&');
          
          // 如果URL已经包含查询参数，则添加&，否则添加?
          url = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
        }
      }

      // 构建请求配置
      const config: AxiosRequestConfig = {
        method: data.method,
        url,
        timeout: data.timeout || 10000,
        headers: data.headers
          .filter(header => header.enabled)
          .reduce((acc, header) => ({ ...acc, [header.key]: header.value }), {}),
      };

      // 处理请求体
      if (data.method !== 'GET' && data.method !== 'HEAD' && data.body) {
        if (data.contentType === 'application/json') {
          config.data = data.body;
        } else if (data.contentType === 'application/x-www-form-urlencoded') {
          // 转换为URLSearchParams
          const formData = new URLSearchParams();
          Object.entries(data.body).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          config.data = formData;
          config.headers = { ...config.headers, 'Content-Type': data.contentType };
        } else {
          // 其他内容类型直接传递
          config.data = data.body;
          config.headers = { ...config.headers, 'Content-Type': data.contentType };
        }
      }

      // 发送请求
      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();
      
      // 计算响应大小
      const responseSize = this.calculateResponseSize(response);
      
      // 格式化响应
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - startTime,
        size: responseSize
      };

      // 如果需要保存到历史记录
      if (data.saveToHistory !== false && userId) {
        await this.prisma.apiTestHistory.create({
          data: {
            name: data.name || '未命名请求',
            url: data.url,
            method: data.method,
            request: data as any,
            response: result,
            userId
          }
        });
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      
      // 格式化错误响应
      const errorResponse = {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        data: error.response?.data || { message: error.message },
        time: endTime - startTime,
        size: 0,
        error: true
      };

      // 如果需要保存到历史记录
      if (data.saveToHistory !== false && userId) {
        await this.prisma.apiTestHistory.create({
          data: {
            name: data.name || '未命名请求(失败)',
            url: data.url,
            method: data.method,
            request: data as any,
            response: errorResponse,
            userId
          }
        });
      }

      return errorResponse;
    }
  }
}