// 导出所有类型
export * from './types';

// 导出错误处理工具
export * from './error';

// 导出请求实例和方法
export { default as service } from './service';
export { request } from './request';

// 默认导出请求方法
import request from './request';
export default request;
