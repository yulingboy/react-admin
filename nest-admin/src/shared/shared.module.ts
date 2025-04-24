import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ExportModule } from './export/export.module';
import { HttpClientModule } from './http-client/http-client.module';

/**
 * 共享模块，用于导出可共享的服务和模块
 */
@Module({
  imports: [PrismaModule, RedisModule, ExportModule, HttpClientModule],
  exports: [PrismaModule, RedisModule, ExportModule, HttpClientModule],
})
export class SharedModule {}