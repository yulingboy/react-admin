import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Result from 'src/common/utils/result';

/**
 * 响应数据转换拦截器
 * 将所有接口返回数据统一包装为标准的响应格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Result<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Result<T>> {
    return next.handle().pipe(
      map(data => {
        // 如果返回的已经是Result类型，直接返回
        if (data instanceof Result) {
          return data;
        }
        // 否则使用Result.ok包装返回数据
        return Result.ok(data);
      }),
    );
  }
}
