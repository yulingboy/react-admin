import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ApiMonitorInterceptor } from './modules/monitoring-module/api-monitor/api-monitor.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { LogModule } from './modules/log-module/log-module.module';
import { LogInterceptor } from './common/interceptors/log.interceptor';

import { AuthModuleGroup } from './modules/auth-module/auth-module.module';
import { MonitoringModuleGroup } from './modules/monitoring-module/monitoring-module.module';
import { SystemModuleGroup } from './modules/system-module/system-module.module';
import { ToolsModuleGroup } from './modules/tools-module/tools-module.module';
import { FinanceModule } from './modules/finance-module/finance.module';
import { JwtAuthGuard } from './modules/auth-module/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    // 注册Bull队列模块，使用Redis配置
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      defaultJobOptions: {
        removeOnComplete: true, // 默认成功后删除
        removeOnFail: 10,       // 保留最近10个失败任务
      },
    }),
    ScheduleModule.forRoot(), // 注册定时任务模块
    PrismaModule,
    LoggerModule,
    LogModule,  // 注册日志模块
    AuthModuleGroup,
    MonitoringModuleGroup,
    SystemModuleGroup,
    ToolsModuleGroup,
    FinanceModule, // 注册记账理财模块
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    // 注册API监控拦截器作为全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMonitorInterceptor,
    },
    // 注册操作日志拦截器作为全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LogInterceptor,
    },
    // 提供操作日志服务，供拦截器使用
    {
      provide: 'OperLogService',
      useFactory: (operLogService) => operLogService,
      inject: ['OPER_LOG_SERVICE'],
    },
    // 注册JWT认证守卫为全局守卫，统一拦截校验token
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 将 HTTP 日志中间件应用到所有路由
    consumer.apply().forRoutes('*');
  }
}
