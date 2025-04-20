import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

/**
 * 创建登录日志DTO
 */
export class CreateLoginLogDto {
  @IsOptional()
  @IsInt()
  userId?: number; // 用户ID，可能为空（登录失败的情况）

  @IsNotEmpty()
  @IsString()
  username: string; // 用户名

  @IsNotEmpty()
  @IsString()
  ipAddress: string; // 登录IP地址

  @IsOptional()
  @IsString()
  loginLocation?: string; // 登录地点

  @IsOptional()
  @IsString()
  browser?: string; // 浏览器类型

  @IsOptional()
  @IsString()
  os?: string; // 操作系统

  @IsOptional()
  @IsString()
  status: string = '0'; // 登录状态（0失败 1成功）

  @IsOptional()
  @IsString()
  msg?: string; // 提示消息
}