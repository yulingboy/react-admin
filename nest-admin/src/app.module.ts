import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigsModule } from './modules/configs/configs.module';
import { LoggerModule } from './shared/logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';
import { ConfigModule } from '@nestjs/config';
import { DictionariesModule } from './modules/dictionaries/dictionaries.module';
import { CodeGeneratorModule } from './modules/code-generator/code-generator.module';
import { SqlExecutorModule } from './modules/sql-executor/sql-executor.module';
import { ApiTesterModule } from './modules/api-tester/api-tester.module';
import { DbManagerModule } from './modules/db-manager/db-manager.module';
import { SystemMonitorModule } from './modules/system-monitor/system-monitor.module';
import { ApiMonitorInterceptor } from './modules/system-monitor/interceptors/api-monitor.interceptor';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    PrismaModule,
    LoggerModule,
    UsersModule,
    RolesModule,
    AuthModule,
    ConfigsModule,
    DictionariesModule,
    CodeGeneratorModule,
    SqlExecutorModule,
    ApiTesterModule,
    DbManagerModule,
    SystemMonitorModule, // 引入系统监控模块
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
