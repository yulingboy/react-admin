import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 获取请求开始时间
    const start = Date.now();
    const { method, originalUrl, ip, body } = req;

    // 捕获响应体数据
    const originalSend = res.send;
    let responseBody: any;

    res.send = function (this: Response, ...args: any[]) {
      responseBody = args[0];
      return originalSend.apply(this, args);
    };

    // 在响应结束时记录单行日志信息
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      // 构建基础日志信息
      const logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms - IP: ${ip}`;

      if (statusCode >= 400) {
        // 尝试解析错误信息
        let errorInfo = '';
        try {
          if (responseBody) {
            const errorResponse = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
            if (errorResponse.message) {
              errorInfo = ` - 错误: ${errorResponse.message}`;
            } else if (errorResponse.error) {
              errorInfo = ` - 错误: ${errorResponse.error}`;
            }
          }
        } catch (e) {
          // 解析失败时不添加错误详情
        }

        // 记录请求体数据（可能包含错误的原因）
        const requestData = body && Object.keys(body).length > 0 ? ` - 请求数据: ${JSON.stringify(body)}` : '';

        // 记录错误日志（包含状态码、错误信息和请求数据）
        this.logger.error(`${logMessage}${errorInfo}${requestData}`, null, 'HttpRequest');
      } else {
        this.logger.log(logMessage, 'HttpRequest');
      }
    });

    next();
  }
}
