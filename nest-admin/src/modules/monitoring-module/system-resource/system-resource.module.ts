import { Module } from '@nestjs/common';
import { SystemResourceController } from './system-resource.controller';
import { SystemResourceService } from './system-resource.service';
import { SharedModule } from '../../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [SystemResourceController],
  providers: [SystemResourceService],
  exports: [SystemResourceService],
})
export class SystemResourceModule {}