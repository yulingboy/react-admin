import { Module } from '@nestjs/common';
import { AccountTypesService } from './account-types.service';
import { AccountTypesController } from './account-types.controller';
import { PrismaModule } from '@/shared/prisma/prisma.module';

/**
 * 账户类型模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [AccountTypesController],
  providers: [AccountTypesService],
  exports: [AccountTypesService],
})
export class AccountTypesModule {}