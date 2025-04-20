import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/modules/auth-module/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'nest-admin-secret-key', // 保持与 auth.module.ts 中的 secret 一致
    });
  }

  async validate(payload: any) {
    this.logger.log(`验证 JWT payload: ${JSON.stringify(payload)}`);
    if (!payload || !payload.sub) {
      this.logger.warn('身份验证失败: JWT payload 无效');
      throw new UnauthorizedException('身份验证失败');
    }
    // 通过 payload.sub 查找用户
    const user = await this.userService.findOneById(parseInt(payload.sub, 10));

    if (!user) {
      this.logger.warn('身份验证失败: 用户不存在');
      throw new UnauthorizedException('身份验证失败');
    }

    // if (user.isDisabled) {
    //   this.logger.warn('身份验证失败: 用户已被禁用');
    //   throw new UnauthorizedException('用户已被禁用');
    // }

    this.logger.log(`用户验证成功: ${user.username}`);
    return user;
  }
}
