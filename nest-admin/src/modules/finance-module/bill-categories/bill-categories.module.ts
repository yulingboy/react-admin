import { Module } from '@nestjs/common';
import { BillCategoriesService } from './bill-categories.service';
import { BillCategoriesController } from './bill-categories.controller';
import { PrismaModule } from '@/shared/prisma/prisma.module';

/**
 * 账单分类模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [BillCategoriesController],
  providers: [BillCategoriesService],
  exports: [BillCategoriesService],
})
export class BillCategoriesModule {}