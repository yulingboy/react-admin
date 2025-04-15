import { Module } from '@nestjs/common';
import { SqlExecutorController } from './sql-executor.controller';
import { SqlExecutorService } from './sql-executor.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SqlExecutorController],
  providers: [SqlExecutorService],
  exports: [SqlExecutorService],
})
export class SqlExecutorModule {}