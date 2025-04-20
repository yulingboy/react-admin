import { PrismaModule } from '@/shared/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { OperLogController } from './oper-log.controller';
import { OperLogService } from './oper-log.service';

/**
 * 操作日志模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [OperLogController],
  providers: [
    OperLogService,
    {
      provide: 'OPER_LOG_SERVICE',
      useExisting: OperLogService
    }
  ],
  exports: [OperLogService, 'OPER_LOG_SERVICE'],
})
export class OperLogModule {}