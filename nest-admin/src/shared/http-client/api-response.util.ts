import { Injectable } from '@nestjs/common';

/**
 * 第三方API响应处理工具类
 * 用于标准化和解析不同第三方API的响应格式
 */
@Injectable()
export class ApiResponseUtil {
  /**
   * 标准化第三方API响应
   * @param response 原始响应数据
   * @param successField 成功标志字段名
   * @param dataField 数据字段名
   * @param messageField 消息字段名
   * @returns 标准化后的响应对象
   */
  static standardizeResponse<T>(
    response: any,
    successField: string = 'success',
    dataField: string = 'data',
    messageField: string = 'message',
  ): {
    success: boolean;
    data: T | null;
    message: string;
    rawResponse: any;
  } {
    // 尝试提取成功标志
    const success = this.extractFieldValue(response, successField, true);
    
    // 尝试提取数据
    const data = this.extractFieldValue(response, dataField, null);
    
    // 尝试提取消息
    const message = this.extractFieldValue(response, messageField, '');
    
    return {
      success: typeof success === 'boolean' ? success : true,
      data: data as T,
      message: typeof message === 'string' ? message : '',
      rawResponse: response,
    };
  }
  
  /**
   * 从嵌套对象中提取字段值
   * @param obj 对象
   * @param field 字段路径，支持点号分隔的嵌套路径
   * @param defaultValue 默认值
   * @returns 字段值或默认值
   */
  static extractFieldValue(obj: any, field: string, defaultValue: any): any {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }
    
    const paths = field.split('.');
    let current = obj;
    
    for (const path of paths) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      
      current = current[path];
      
      if (current === undefined) {
        return defaultValue;
      }
    }
    
    return current !== null && current !== undefined ? current : defaultValue;
  }
  
  /**
   * 解析分页数据
   * @param response 响应数据
   * @param itemsField 列表项字段名
   * @param totalField 总数字段名
   * @param pageField 当前页字段名
   * @param pageSizeField 每页大小字段名
   * @returns 标准化的分页数据
   */
  static parsePagination<T>(
    response: any,
    itemsField: string = 'list',
    totalField: string = 'total',
    pageField: string = 'page',
    pageSizeField: string = 'pageSize',
  ): {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const items = this.extractFieldValue(response, itemsField, []) as T[];
    const total = this.extractFieldValue(response, totalField, 0) as number;
    const page = this.extractFieldValue(response, pageField, 1) as number;
    const pageSize = this.extractFieldValue(response, pageSizeField, 10) as number;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
  
  /**
   * 检查响应是否成功
   * @param response 响应数据
   * @param successField 成功标志字段名
   * @param successValue 成功标志预期值
   * @returns 是否成功
   */
  static isSuccess(
    response: any,
    successField: string = 'code',
    successValue: any = 0,
  ): boolean {
    const value = this.extractFieldValue(response, successField, null);
    
    if (value === null) {
      return false;
    }
    
    return value === successValue;
  }
}