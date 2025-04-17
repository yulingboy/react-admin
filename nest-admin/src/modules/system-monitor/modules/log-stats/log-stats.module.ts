import { Module } from '@nestjs/common';
import { LogStatsService } from './log-stats.service';
import { LogStatsController } from './log-stats.controller';
import { PrismaModule } from '../../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LogStatsController],
  providers: [LogStatsService],
  exports: [LogStatsService],
})
export class LogStatsModule {}