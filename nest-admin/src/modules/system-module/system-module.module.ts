import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleJobModule } from './schedule-job/schedule-job.module';

@Module({
  imports: [ConfigsModule, DictionariesModule, NotificationsModule, ScheduleJobModule],
  exports: [ConfigsModule, DictionariesModule, NotificationsModule, ScheduleJobModule],
})
export class SystemModuleGroup {}