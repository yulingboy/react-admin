import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, ValidationError } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';
import { Response } from 'express';

/**
 * 验证异常过滤器
 * 处理并格式化验证错误的响应
 */
@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errors = this.formatErrors(exception.validationErrors);

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: '请求参数验证失败',
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 格式化验证错误
   * @param validationErrors 验证错误列表
   * @returns 格式化后的错误信息
   */
  private formatErrors(validationErrors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      const property = error.property;
      const errorMessages = Object.values(error.constraints || {});

      if (errorMessages.length > 0) {
        result[property] = errorMessages;
      }

      if (error.children?.length) {
        const childErrors = this.formatErrors(error.children);
        Object.keys(childErrors).forEach((key) => {
          const nestedKey = `${property}.${key}`;
          result[nestedKey] = childErrors[key];
        });
      }
    });

    return result;
  }
}
