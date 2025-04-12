import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotFoundExceptionFilter } from './common/filters/not-found.filter';
import { AppLoggerService } from './shared/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLoggerService(), // 使用自定义日志服务
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted 设置为 false，允许请求中存在未定义在 DTO 中的属性
      forbidNonWhitelisted: false,
    }),
  );

  // 注册全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册HTTP异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 注册全局异常过滤器
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // 注册全局404异常过滤器
  app.useGlobalFilters(new NotFoundExceptionFilter());

  // 启动应用
  await app.listen(3000);
  const logger = app.get(AppLoggerService);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
