import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 更新配置DTO
 * 定义更新配置需要的参数，所有字段都是可选的
 */
export class UpdateConfigDto {
  /**
   * 配置ID
   */
  @IsInt({ message: '配置ID必须是整数' })
  @Min(1, { message: '配置ID必须大于0' })
  @Max(999999, { message: '配置ID不能大于999999' })
  id: number;

  /**
   * 配置键名
   */
  @IsOptional()
  @IsString({ message: '配置键名必须是字符串' })
  @MinLength(2, { message: '配置键名长度不能小于2' })
  @MaxLength(50, { message: '配置键名长度不能大于50' })
  key?: string;

  /**
   * 配置值
   */
  @IsOptional()
  @IsString({ message: '配置值必须是字符串' })
  value?: string;

  /**
   * 配置描述
   */
  @IsOptional()
  @IsString({ message: '配置描述必须是字符串' })
  @MaxLength(200, { message: '配置描述长度不能大于200' })
  description?: string;

  /**
   * 配置类型
   */
  @IsOptional()
  @IsString({ message: '配置类型必须是字符串' })
  type?: string;

  /**
   * 配置分组
   */
  @IsOptional()
  @IsString({ message: '配置分组必须是字符串' })
  group?: string;

  /**
   * 排序值
   */
  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  @Min(0, { message: '排序值不能小于0' })
  @Max(9999, { message: '排序值不能大于9999' })
  sort?: number;

  /**
   * 配置状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 是否系统内置配置
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统内置配置值必须是有效的枚举值' })
  isSystem?: string;
}
