import { Module } from '@nestjs/common';
import { ConfigsModule } from './configs/configs.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ConfigsModule, DictionariesModule, NotificationsModule],
  exports: [ConfigsModule, DictionariesModule, NotificationsModule],
})
export class SystemModuleGroup {}