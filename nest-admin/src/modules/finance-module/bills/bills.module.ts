import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { BillsCreateService } from './services/bills-create.service';
import { BillsQueryService } from './services/bills-query.service';
import { BillsUpdateService } from './services/bills-update.service';
import { BillsDeleteService } from './services/bills-delete.service';
import { BillsStatisticsService } from './services/bills-statistics.service';

/**
 * 账单模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [BillsController],
  providers: [
    BillsService,
    BillsCreateService,
    BillsQueryService,
    BillsUpdateService,
    BillsDeleteService,
    BillsStatisticsService
  ],
  exports: [BillsService],
})
export class BillsModule {}