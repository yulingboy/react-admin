import { IsString, IsEmail, IsOptional, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 创建用户DTO
 * 定义创建用户需要的参数
 */
export class CreateUserDto {
  /**
   * 用户名，唯一标识
   */
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能小于3' })
  @MaxLength(20, { message: '用户名长度不能大于20' })
  username: string;

  /**
   * 用户密码
   */
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能小于6' })
  @MaxLength(30, { message: '密码长度不能大于30' })
  password: string;

  /**
   * 电子邮箱
   */
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  /**
   * 用户姓名
   */
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  name?: string;

  /**
   * 用户头像URL
   */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  /**
   * 用户状态，默认为1（正常）
   */
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态值不能小于0' })
  @Max(10, { message: '状态值不能大于10' })
  @Transform(({ value }) => Number(value))
  status?: number = 1;

  /**
   * 用户角色ID
   */
  @IsInt({ message: '角色ID必须是整数' })
  @Min(1, { message: '角色ID必须大于0' })
  @Transform(({ value }) => Number(value))
  roleId: number;
}
