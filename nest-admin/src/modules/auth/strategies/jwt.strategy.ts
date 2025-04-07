import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'nest-admin-secret-key', // 保持与 auth.module.ts 中的 secret 一致
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(parseInt(payload.sub, 10));
    
    if (!user) {
      throw new UnauthorizedException('身份验证失败');
    }
    
    return user;
  }
}
