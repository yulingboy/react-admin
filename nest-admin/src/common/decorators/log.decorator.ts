import { SetMetadata } from '@nestjs/common';

/**
 * 操作日志类型枚举
 */
export enum BusinessType {
  OTHER = '0',   // 其它
  INSERT = '1',  // 新增
  UPDATE = '2',  // 修改
  DELETE = '3',  // 删除
  GRANT = '4',   // 授权
  EXPORT = '5',  // 导出
  IMPORT = '6',  // 导入
  FORCE = '7',   // 强退
  CLEAN = '8',   // 清空数据
}

/**
 * 操作人类别枚举
 */
export enum OperatorType {
  OTHER = '0',      // 其它
  ADMIN = '1',      // 后台用户
  MOBILE = '2',     // 手机端用户
}

// 操作日志元数据Key
export const LOG_KEY = 'log';

/**
 * 操作日志配置接口
 */
export interface LogOptions {
  title: string;             // 操作模块
  businessType?: BusinessType; // 业务类型
  operatorType?: OperatorType; // 操作人类别
  isSaveRequestData?: boolean; // 是否保存请求的数据
  isSaveResponseData?: boolean; // 是否保存响应的数据
}

/**
 * 自定义操作日志装饰器
 * @param options 操作日志选项
 */
export const Log = (options: LogOptions) => {
  return SetMetadata(LOG_KEY, options);
};