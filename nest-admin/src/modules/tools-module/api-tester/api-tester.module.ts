import { Module } from '@nestjs/common';
import { ApiTesterController } from './api-tester.controller';
import { 
  ApiTesterService,
  ApiTesterBaseService,
  ApiTesterRequestService,
  ApiTesterHistoryService,
  ApiTesterTemplateService
} from './services';
import { SharedModule } from '@/shared/shared.module';

/**
 * API测试模块
 * 提供API接口测试功能，包括请求发送、历史记录和模板管理
 */
@Module({
  imports: [SharedModule],
  controllers: [ApiTesterController],
  providers: [
    ApiTesterBaseService,
    ApiTesterRequestService,
    ApiTesterHistoryService,
    ApiTesterTemplateService,
    ApiTesterService
  ],
  exports: [ApiTesterService]
})
export class ApiTesterModule {}