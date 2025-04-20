import { Module } from '@nestjs/common';
import { ApiTesterController } from './api-tester.controller';
import { ApiTesterService } from './api-tester.service';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ApiTesterController],
  providers: [ApiTesterService],
  exports: [ApiTesterService]
})
export class ApiTesterModule {}