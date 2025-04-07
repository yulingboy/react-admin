import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotFoundExceptionFilter } from './filters/not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
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
}
bootstrap();
