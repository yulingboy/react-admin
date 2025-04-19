import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler, 
  Logger 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiMonitorService } from '../modules/api-monitor/api-monitor.service';

@Injectable()
export class ApiMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiMonitorInterceptor.name);

  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 如果是系统监控相关的请求，不进行记录避免递归
    if (this.isMonitoringRequest(context)) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - startTime;
          const statusCode = context.switchToHttp().getResponse().statusCode || 200;
          
          // 异步记录API请求，不影响响应速度
          this.recordApiRequest(url, method, statusCode, responseTime);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // 异步记录API请求错误
          this.recordApiRequest(url, method, statusCode, responseTime);
        }
      })
    );
  }

  private isMonitoringRequest(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { url } = request;
    
    // 如果是系统监控相关的请求，不进行记录，避免无限递归
    return url.includes('/api/system-monitor/');
  }

  private recordApiRequest(path: string, method: string, statusCode: number, responseTime: number): void {
    try {
      // 移除查询参数
      const cleanPath = path.split('?')[0].replace('/api', '');
      
      // 异步记录API请求，不阻塞主线程
      this.apiMonitorService.recordApiRequest({
        path: cleanPath, 
        method, 
        statusCode, 
        responseTime
      }).catch(err => 
        this.logger.error(`Failed to record API request: ${err.message}`, err.stack)
      );
    } catch (error) {
      this.logger.error(`Error in recordApiRequest: ${error.message}`, error.stack);
    }
  }
}