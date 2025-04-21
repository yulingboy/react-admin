import { Module } from '@nestjs/common';
import { BillTagsService } from './bill-tags.service';
import { BillTagsController } from './bill-tags.controller';
import { PrismaModule } from '@/shared/prisma/prisma.module';

/**
 * 账单标签模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [BillTagsController],
  providers: [BillTagsService],
  exports: [BillTagsService],
})
export class BillTagsModule {}