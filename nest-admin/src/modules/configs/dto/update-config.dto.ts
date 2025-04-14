import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

export class UpdateConfigDto {
  @IsInt()
  @IsNotEmpty({ message: '配置ID不能为空' })
  id: number;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '配置键长度不能超过100' })
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;

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

  @IsInt()
  @IsOptional()
  sort?: number;

  /**
   * 配置状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 是否为系统配置
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统标识必须是有效的枚举值' })
  isSystem?: string;
}
