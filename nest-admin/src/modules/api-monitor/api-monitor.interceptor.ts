import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
    const { method, originalUrl, ip, headers } = request;
    // 去掉查询参数，只保留路径部分
    const path = originalUrl.split('?')[0];
    
    // 获取请求体大小
    const contentLength = request.headers['content-length'] ? parseInt(request.headers['content-length'], 10) : 0;
    
    // 尝试获取用户ID（如果已认证）
    const userId = request.user?.id || null;
    
    // 排除不需要监控的路径
    if (
      path.includes('/health') ||
      path.includes('/metrics') ||
      path.includes('/system-monitor') || // 避免监控自己导致的递归
      path.includes('/favicon.ico')
    ) {
      return next.handle();
    }
    
    // 尝试获取用户代理
    const userAgent = headers['user-agent'] || '';
    
    // 捕获返回结果以监控响应大小
    return next
      .handle()
      .pipe(
        tap((data) => {
          try {
            // 获取响应状态码和计算响应时间
            const statusCode = response.statusCode;
            const responseTime = Date.now() - startTime;
            
            // 估算响应大小
            let responseSize = 0;
            if (data) {
              // 尝试计算响应大小 (JSON字符串的近似大小)
              try {
                responseSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
              } catch (e) {
                // 忽略序列化错误
              }
            }
            
            // 异步记录API请求信息
            this.apiMonitorService.recordApiRequest({
              path,
              method,
              statusCode,
              responseTime,
              contentLength,
              responseSize,
              userId,
              userAgent,
              ip
            }).catch(err => {
              console.error('Failed to record API request:', err);
            });
          } catch (error) {
            // 确保即使监控功能出错，也不会影响正常API响应
            console.error('Error in API monitoring interceptor:', error);
          }
        }),
        catchError(error => {
          // 记录错误请求
          try {
            const statusCode = error.status || 500;
            const responseTime = Date.now() - startTime;
            
            this.apiMonitorService.recordApiRequest({
              path,
              method,
              statusCode,
              responseTime,
              contentLength,
              responseSize: 0,
              userId,
              userAgent,
              ip,
              errorMessage: error.message || 'Unknown error'
            }).catch(err => {
              console.error('Failed to record API error:', err);
            });
          } catch (recordError) {
            console.error('Error recording API error:', recordError);
          }
          
          // 重新抛出错误，不影响正常的错误处理流程
          throw error;
        })
      );
  }
}