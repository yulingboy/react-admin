

import { HttpStatus } from "src/common/constant/httpStatus";

/**
 * 通用返回结果类
 */
export default class Result<T> {
  code: number;
  message: string;
  data: T;

  constructor(
    code: number = HttpStatus.SUCCESS,
    message: string = '成功',
    data: T = null,
  ) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  /**
   * 返回成功结果
   */
  static ok<K = null>(data: K = null, message: string = '成功') {
    return new Result<K>(HttpStatus.SUCCESS, message, data);
  }

  /**
   * 返回失败结果
   */
  static error(message: string = '操作失败', code: number = HttpStatus.ERROR) {
    return new Result(code, message, null);
  }

  /**
   * 返回错误请求结果
   */
  static badRequest(message: string = '请求参数错误') {
    return new Result(HttpStatus.BAD_REQUEST, message, null);
  }

  /**
   * 返回资源未找到结果
   */
  static notFound(message: string = '资源不存在') {
    return Result.error(message, HttpStatus.NOT_FOUND);
  }

  /**
   * 返回未授权结果
   */
  static unauthorized(message: string = '未授权访问') {
    return Result.error(message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * 返回禁止访问结果
   */
  static forbidden(message: string = '禁止访问') {
    return Result.error(message, HttpStatus.FORBIDDEN);
  }

  /**
   * 返回参数验证失败结果
   */
  static validation(message: string = '参数验证失败') {
    return Result.error(message, HttpStatus.Validation);
  }

  /**
   * 返回请求频繁结果
   */
  static frequent(message: string = '请求过于频繁') {
    return Result.error(message, HttpStatus.FREQUENT_REQUESTS);
  }

  /**
   * 根据影响行数返回操作结果
   */
  static toAjax(affectRows: number) {
    return affectRows > 0
      ? Result.ok(null, '操作成功')
      : Result.error('操作失败');
  }

  /**
   * 返回表格数据
   */
  static tableData<L = any>(rows: L[], total: number) {
    return Result.ok({
      rows,
      total,
    }, '查询成功');
  }
}
