import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ApiMonitorInterceptor } from './modules/monitoring-module/api-monitor/api-monitor.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModuleGroup } from './modules/auth-module/auth-module.module';
import { MonitoringModuleGroup } from './modules/monitoring-module/monitoring-module.module';
import { SystemModuleGroup } from './modules/system-module/system-module.module';
import { ToolsModuleGroup } from './modules/tools-module/tools-module.module';

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
    AuthModuleGroup,
    MonitoringModuleGroup,
    SystemModuleGroup,
    ToolsModuleGroup
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 将 HTTP 日志中间件应用到所有路由
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
