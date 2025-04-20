import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleJobController } from './schedule-job.controller';
import { ScheduleJobService } from './schedule-job.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 导入NestJS的定时任务模块
    PrismaModule,
  ],
  controllers: [ScheduleJobController],
  providers: [ScheduleJobService],
  exports: [ScheduleJobService],
})
export class ScheduleJobModule implements OnModuleInit {
  constructor(private readonly scheduleJobService: ScheduleJobService) {}

  /**
   * 模块初始化时，加载所有启用状态的定时任务
   */
  async onModuleInit() {
    await this.scheduleJobService.initJobs();
  }
}