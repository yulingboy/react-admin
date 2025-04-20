import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { ExportModule } from './export/export.module';

/**
 * 共享模块，用于导出可共享的服务和模块
 */
@Module({
  imports: [PrismaModule, RedisModule, ExportModule],
  exports: [PrismaModule, RedisModule, ExportModule],
})
export class SharedModule {}