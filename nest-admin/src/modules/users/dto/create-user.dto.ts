import { IsString, IsEmail, IsOptional, IsInt, Min, Length, IsNotEmpty, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 创建用户DTO
 * 定义创建用户需要的参数
 */
export class CreateUserDto {
  /**
   * 用户名，唯一标识，长度在3到20之间
   */
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 20, { message: '用户名长度必须在3到20之间' })
  username: string;

  /**
   * 用户密码，长度在6到20之间
   */
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度必须在6到20之间' })
  password?: string;

  /**
   * 电子邮箱，必须符合邮箱格式，长度在5到50之间
   */
  @IsEmail({}, { message: '邮箱格式不正确' })
  @Transform(({ value }) => value.trim())
  @Length(5, 50, { message: '邮箱长度必须在5到50之间' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  /**
   * 用户姓名，可选，长度在2到10之间
   */
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @Transform(({ value }) => value.trim())
  @Length(2, 10, { message: '姓名长度必须在2到10之间' })
  name?: string;

  /**
   * 用户头像URL，可选，长度不能超过255个字符
   */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  @Transform(({ value }) => value.trim())
  @Length(0, 255, { message: '头像URL长度不能超过255个字符' })
  avatar?: string;

  /**
   * 用户状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;

  /**
   * 用户角色ID，必须是大于0的整数
   */
  @IsInt({ message: '角色ID必须是整数' })
  @Min(1, { message: '角色ID必须大于0' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleId: number;
}
