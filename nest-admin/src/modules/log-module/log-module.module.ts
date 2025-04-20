import { Module } from '@nestjs/common';
import { LoginLogModule } from './login-log/login-log.module';
import { OperLogModule } from './oper-log/oper-log.module';

/**
 * 日志模块
 * 包含登录日志和操作日志功能
 */
@Module({
  imports: [LoginLogModule, OperLogModule],
  exports: [LoginLogModule, OperLogModule],
})
export class LogModule {}