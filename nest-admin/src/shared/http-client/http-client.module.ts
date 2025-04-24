import { Module } from '@nestjs/common';
import { HttpClientService } from './http-client.service';

/**
 * HTTP客户端模块
 * 提供调用第三方API的通用服务
 */
@Module({
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}