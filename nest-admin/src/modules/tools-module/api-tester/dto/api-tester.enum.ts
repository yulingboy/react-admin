/**
 * API测试工具相关枚举
 */

/**
 * HTTP请求方法枚举
 * 定义支持的HTTP请求方法类型
 */
export enum HttpMethod {
  GET = 'GET',       // GET请求，用于获取资源
  POST = 'POST',     // POST请求，用于创建资源
  PUT = 'PUT',       // PUT请求，用于更新资源
  DELETE = 'DELETE', // DELETE请求，用于删除资源
  PATCH = 'PATCH',   // PATCH请求，用于部分更新资源
  HEAD = 'HEAD',     // HEAD请求，类似GET但不返回响应体
  OPTIONS = 'OPTIONS' // OPTIONS请求，用于获取目标资源支持的通信选项
}

/**
 * 请求内容类型枚举
 * 定义支持的请求体内容类型
 */
export enum ContentType {
  JSON = 'application/json',                      // JSON格式
  FORM = 'application/x-www-form-urlencoded',     // 表单数据格式
  MULTIPART = 'multipart/form-data',              // 多部分数据格式，用于文件上传
  XML = 'application/xml',                        // XML格式
  TEXT = 'text/plain'                             // 纯文本格式
}