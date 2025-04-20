import { PrismaModule } from '@/shared/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { LoginLogController } from './login-log.controller';
import { LoginLogService } from './login-log.service';

/**
 * 登录日志模块
 */
@Module({
  imports: [PrismaModule],
  controllers: [LoginLogController],
  providers: [LoginLogService],
  exports: [LoginLogService],
})
export class LoginLogModule {}