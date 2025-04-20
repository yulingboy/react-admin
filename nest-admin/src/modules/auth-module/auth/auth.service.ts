import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { LoginLogRecordService } from '../services/login-log-record.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private loginLogService: LoginLogRecordService,
  ) {}

  async validateUser(username: string, password: string, request: Request): Promise<any> {
    try {
      const user = await this.usersService.findByUsernameOrEmail(username);

      if (!user) {
        // 记录登录失败日志 - 用户不存在
        await this.loginLogService.recordLoginFailure(username, request, '用户名不存在');
        throw new UnauthorizedException('用户名不存在');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // 记录登录失败日志 - 密码错误
        await this.loginLogService.recordLoginFailure(username, request, '密码错误');
        throw new UnauthorizedException('密码错误');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      // 如果是我们主动抛出的认证异常，则已经记录了日志，无需再次记录
      if (!(error instanceof UnauthorizedException)) {
        // 记录其他类型的登录失败
        await this.loginLogService.recordLoginFailure(username, request, `登录异常: ${error.message}`);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto, request: Request) {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password, request);

    const payload = { username: user.username, sub: user.id };
    const result = {
      token: this.jwtService.sign(payload),
      user,
    };
    
    // 记录登录成功日志
    await this.loginLogService.recordLoginSuccess(user.id, user.username, request);
    
    return result;
  }
}
