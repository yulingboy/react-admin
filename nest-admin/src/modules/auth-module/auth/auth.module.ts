import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginLogModule } from '../../log-module/login-log/login-log.module';
import { LoginLogRecordService } from '../services/login-log-record.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'nest-admin-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LoginLogModule, // 导入登录日志模块
  ],
  providers: [
    AuthService, 
    JwtStrategy,
    LoginLogRecordService, // 注册登录日志记录服务
  ],
  controllers: [AuthController],
})
export class AuthModule {}
