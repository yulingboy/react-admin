import service from './service';
import { BaseResponse, CustomRequestConfig, RequestParams } from './types';

// 封装请求方法
export const request = {
  /**
   * GET请求
   * @param url 请求地址
   * @param params 请求参数
   * @param config 额外配置
   * @returns Promise
   */
  get<T = any>(url: string, params?: RequestParams, config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    return service.get(url, { params, ...config });
  },

  /**
   * POST请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 额外配置
   * @returns Promise
   */
  post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    return service.post(url, data, config);
  },

  /**
   * PUT请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 额外配置
   * @returns Promise
   */
  put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    return service.put(url, data, config);
  },

  /**
   * DELETE请求
   * @param url 请求地址
   * @param config 额外配置
   * @returns Promise
   */
  delete<T = any>(url: string, config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    return service.delete(url, config);
  },

  /**
   * 文件上传
   * @param url 请求地址
   * @param file 文件对象
   * @param name 文件参数名
   * @param config 额外配置
   * @returns Promise
   */
  upload<T = any>(url: string, file: File, name: string = 'file', config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    const formData = new FormData();
    formData.append(name, file);

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    });
  },

  /**
   * 多文件上传
   * @param url 请求地址
   * @param files 文件对象数组
   * @param name 文件参数名
   * @param config 额外配置
   * @returns Promise
   */
  uploadMultiple<T = any>(url: string, files: File[], name: string = 'files', config?: CustomRequestConfig): Promise<BaseResponse<T>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append(name, file);
    });

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    });
  }
};

// 导出axios实例以便进行高级自定义
export { default as service } from './service';
export * from './types';
export * from './error';
export default request;
