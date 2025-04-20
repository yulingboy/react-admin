import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { LOG_KEY, LogOptions } from '../decorators/log.decorator';
import { BusinessType, OperatorType } from '../decorators/log.decorator';
import { CreateOperLogDto } from '../../modules/log-module/oper-log/dto';

/**
 * 用户请求对象接口扩展
 */
interface RequestWithUser extends Request {
  user?: {
    id?: number;
    username?: string;
    [key: string]: any;
  };
}

/**
 * 操作日志拦截器
 * 用于自动记录操作日志
 */
@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LogInterceptor.name);

  constructor(
    private reflector: Reflector,
    // 将在AppModule中导入LogModule并使用
    @Inject('OperLogService') private operLogService
  ) {}

  /**
   * 拦截器实现
   * @param context 执行上下文
   * @param next 调用处理器
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取请求上下文
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();
    
    // 获取当前处理的控制器方法上的日志装饰器元数据
    const logMetadata: LogOptions = this.reflector.get(LOG_KEY, context.getHandler());
    
    // 如果没有设置日志装饰器，则直接放行
    if (!logMetadata) {
      return next.handle();
    }
    
    // 获取请求开始时间
    const startTime = Date.now();
    
    // 获取请求方法和URL
    const { method, url, ip, body, user } = request;
    
    // 准备操作日志数据
    const operLog: CreateOperLogDto = {
      title: logMetadata.title,
      businessType: logMetadata.businessType || BusinessType.OTHER,
      method: context.getClass().name + '.' + context.getHandler().name,
      requestMethod: method,
      operatorType: logMetadata.operatorType || OperatorType.OTHER,
      operUrl: url,
      operIp: ip,
      // 获取当前登录用户的信息
      operName: user?.username,
      userId: user?.id,
      // 保存请求参数
      operParam: logMetadata.isSaveRequestData ? JSON.stringify(body) : null,
      status: '0', // 默认为成功
    };

    // 在请求处理完成后记录响应结果和操作状态
    return next.handle().pipe(
      tap({
        next: (data) => {
          // 请求成功
          operLog.status = '0'; // 正常
          
          // 计算请求耗时
          const duration = Date.now() - startTime;
          
          // 如果需要保存响应数据
          if (logMetadata.isSaveResponseData) {
            operLog.jsonResult = JSON.stringify(data);
          }
          
          // 异步保存操作日志
          this.saveOperLog(operLog);
        },
        error: (error) => {
          // 请求失败
          operLog.status = '1'; // 异常
          operLog.errorMsg = error.message;
          
          // 异步保存操作日志
          this.saveOperLog(operLog);
        }
      })
    );
  }

  /**
   * 保存操作日志
   * @param operLog 操作日志数据
   */
  private async saveOperLog(operLog: CreateOperLogDto) {
    try {
      await this.operLogService.create(operLog);
    } catch (error) {
      this.logger.error(`保存操作日志失败: ${error.message}`, error.stack);
    }
  }
}