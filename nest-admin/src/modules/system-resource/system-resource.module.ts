import { Module } from '@nestjs/common';
import { SystemResourceService } from './system-resource.service';
import { SystemResourceController } from './system-resource.controller';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SystemResourceController],
  providers: [SystemResourceService],
  exports: [SystemResourceService],
})
export class SystemResourceModule {}