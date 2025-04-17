import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiMonitorService } from './api-monitor.service';
import { ApiMonitorController } from './api-monitor.controller';
import { ApiMonitorInterceptor } from './api-monitor.interceptor';
import { PrismaModule } from '../../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiMonitorController],
  providers: [
    ApiMonitorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMonitorInterceptor,
    },
  ],
  exports: [ApiMonitorService],
})
export class ApiMonitorModule {}