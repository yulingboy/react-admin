import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { RedisModule } from '../../../shared/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ConfigsController],
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
