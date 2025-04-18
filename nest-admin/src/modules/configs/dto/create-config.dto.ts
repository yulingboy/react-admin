import { IsString, IsOptional, IsInt, Min, Length, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

export class CreateConfigDto {
  @IsString()
  @IsNotEmpty({ message: '配置键不能为空' })
  @MaxLength(100, { message: '配置键长度不能超过100' })
  key: string;

  @IsString()
  @IsNotEmpty({ message: '配置值不能为空' })
  value: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: '配置描述长度不能超过200' })
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '配置类型长度不能超过50' })
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '配置分组长度不能超过50' })
  group?: string;

  @IsInt({ message: '排序必须是整数' })
  @IsOptional()
  sort?: number;

  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;

  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统标识必须是有效的枚举值' })
  isSystem?: string = IsSystemEnum.NO;
}
