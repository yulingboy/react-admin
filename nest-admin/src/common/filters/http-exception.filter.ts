import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import Result from 'src/common/utils/result';

/**
 * HTTP异常过滤器
 * 捕获所有HTTP异常并格式化返回
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    // 处理验证错误等情况，获取详细的错误信息
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      message = Array.isArray(exceptionResponse.message) ? exceptionResponse.message[0] : exceptionResponse.message;
    }

    this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`);

    // 使用统一的Result格式响应错误
    const result = Result.error(message, status);

    response.status(status).json(result);
  }
}
