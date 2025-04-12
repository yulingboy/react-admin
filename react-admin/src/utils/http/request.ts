import service from './service';
import { BaseResponse, CustomRequestConfig } from './types';

/**
 * 统一请求方法，提供类型安全和简化API
 */
export const request = {
  /**
   * GET请求
   * @param url 请求地址
   * @param config 请求配置
   */
  get<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   */
  post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    return service.post(url, data, config);
  },

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   */
  put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    return service.put(url, data, config);
  },

  /**
   * DELETE请求
   * @param url 请求地址
   * @param config 请求配置
   */
  delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    return service.delete(url, config);
  },

  /**
   * 文件上传
   * @param url 请求地址
   * @param file 文件对象
   * @param options 上传配置
   */
  upload<T = any>(
    url: string, 
    file: File | File[], 
    options?: {
      name?: string;
      data?: Record<string, any>;
      config?: CustomRequestConfig;
    }
  ): Promise<T> {
    const formData = new FormData();
    const { name = 'file', data = {}, config = {} } = options || {};
    
    // 处理单个或多个文件
    if (Array.isArray(file)) {
      file.forEach(f => formData.append(name, f));
    } else {
      formData.append(name, file);
    }
    
    // 添加额外的表单数据
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return service.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config
    });
  },

  /**
   * 下载文件
   * @param url 请求地址
   * @param params 查询参数
   * @param filename 文件名(可选)
   * @param config 请求配置
   */
  download(url: string, params?: Record<string, any>, filename?: string, config?: CustomRequestConfig): Promise<Blob> {
    return service.get(url, {
      params,
      responseType: 'blob',
      ...config,
    }).then(response => {
      // 这里需要特殊处理，因为返回的是二进制数据
      const blob = new Blob([response.data]);
      // 如果提供了文件名，直接下载
      if (filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
      return blob;
    });
  }
};

export default request;
