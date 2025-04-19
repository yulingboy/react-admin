import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiMonitorService } from './api-monitor.service';

@Injectable()
export class ApiMonitorInterceptor implements NestInterceptor {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 记录请求开始时间
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // 提取请求信息
    const { method, originalUrl } = request;
    // 去掉查询参数，只保留路径部分
    const path = originalUrl.split('?')[0];
    
    // 排除不需要监控的路径
    if (
      path.includes('/health') ||
      path.includes('/metrics') ||
      path.includes('/system-monitor') // 避免监控自己导致的递归
    ) {
      return next.handle();
    }
    
    return next
      .handle()
      .pipe(
        tap(() => {
          try {
            // 获取响应状态码和计算响应时间
            const statusCode = response.statusCode;
            const responseTime = Date.now() - startTime;
            
            // 异步记录API请求信息
            this.apiMonitorService.recordApiRequest({
              path,
              method,
              statusCode,
              responseTime,
            }).catch(err => {
              console.error('Failed to record API request:', err);
            });
          } catch (error) {
            // 确保即使监控功能出错，也不会影响正常API响应
            console.error('Error in API monitoring interceptor:', error);
          }
        }),
      );
  }
}