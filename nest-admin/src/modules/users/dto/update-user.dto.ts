import { IsString, IsEmail, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 更新用户DTO
 * 定义更新用户需要的参数，所有字段都是可选的
 */
export class UpdateUserDto {
  /**
   * 用户ID
   */
  @IsInt({ message: '用户ID必须是整数' })
  @Min(1, { message: '用户ID必须大于0' })
  @Max(999999, { message: '用户ID不能大于999999' })
  @Transform(({ value }) => Number(value))
  id: number;

  /**
   * 用户名
   */
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能小于3' })
  @MaxLength(20, { message: '用户名长度不能大于20' })
  username?: string;

  /**
   * 用户密码
   */
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能小于6' })
  @MaxLength(30, { message: '密码长度不能大于30' })
  password?: string;

  /**
   * 电子邮箱
   */
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  /**
   * 用户姓名
   */
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @MaxLength(50, { message: '姓名长度不能大于50' })
  name?: string;

  /**
   * 用户头像URL
   */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  /**
   * 用户状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 用户角色ID
   */
  @IsOptional()
  @IsInt({ message: '角色ID必须是整数' })
  @Min(1, { message: '角色ID必须大于0' })
  @Transform(({ value }) => Number(value))
  roleId?: number;
}
