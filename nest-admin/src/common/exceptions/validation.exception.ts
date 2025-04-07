import { BadRequestException, ValidationError } from '@nestjs/common';

/**
 * 自定义验证异常类
 * 用于处理数据验证失败的情况
 */
export class ValidationException extends BadRequestException {
  constructor(public validationErrors: ValidationError[]) {
    super('请求参数验证失败');
  }
}
