import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import Result from 'src/common/utils/result';

/**
 * 全局异常过滤器
 * 捕获所有未处理的异常并格式化返回
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        message = Array.isArray(exceptionResponse.message) ? exceptionResponse.message[0] : exceptionResponse.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // 处理一般错误
      message = exception.message;
      this.logger.error(exception.stack);
    } else {
      // 处理未知错误
      this.logger.error(`未知异常: ${exception}`);
    }

    const responseBody = Result.error(message, status);

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
