import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 用户信息装饰器
 * 用法示例: @User() user: any, @User('id') userId: number
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了数据属性，则返回该属性值
    return data ? user?.[data] : user;
  },
);