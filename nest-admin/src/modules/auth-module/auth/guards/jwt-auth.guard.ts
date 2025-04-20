import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      this.logger.log('跳过鉴权: 公共路由');
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn('鉴权失败: 登录已过期');
        throw new UnauthorizedException('登录已过期，请重新登录');
      } else if (info?.name === 'JsonWebTokenError') {
        this.logger.warn('鉴权失败: 无效的令牌');
        throw new UnauthorizedException('无效的令牌');
      } else {
        this.logger.warn('鉴权失败: 身份验证失败');
        throw new UnauthorizedException('身份验证失败');
      }
    }
    this.logger.log(`鉴权成功: 用户 ${user.username}`);
    return user;
  }
}
