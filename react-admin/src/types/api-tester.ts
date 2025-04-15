/**
 * API测试接口类型定义
 */

/**
 * HTTP请求方法
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * 请求内容类型
 */
export enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
  XML = 'application/xml',
  TEXT = 'text/plain'
}

/**
 * 请求头项
 */
export interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

/**
 * 请求参数项
 */
export interface ParamItem {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

/**
 * 接口测试请求数据
 */
export interface ApiTestRequest {
  id?: number;
  name?: string;
  url: string;
  method: HttpMethod;
  headers: HeaderItem[];
  params?: ParamItem[];
  body?: any;
  contentType: ContentType;
  description?: string;
  timeout?: number;
  saveToHistory?: boolean;
}

/**
 * 接口测试响应数据
 */
export interface ApiTestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number; // 响应时间(毫秒)
  size: number; // 响应大小(字节)
}

/**
 * 接口测试历史记录
 */
export interface ApiTestHistory {
  id: number;
  name: string;
  url: string;
  method: HttpMethod;
  request: ApiTestRequest;
  response?: ApiTestResponse;
  createdAt: string;
  userId?: number;
}

/**
 * 接口测试历史查询参数
 */
export interface ApiTestHistoryQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  method?: HttpMethod;
  url?: string;
  startTime?: string;
  endTime?: string;
}