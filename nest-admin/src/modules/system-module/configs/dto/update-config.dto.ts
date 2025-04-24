import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum, Length } from 'class-validator';
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
  @Transform(({ value }) => Number(value))
  id: number;

  /**
   * 配置键名
   */
  @IsOptional()
  @IsString({ message: '配置键名必须是字符串' })
  @Length(2, 50, { message: '配置键名长度必须在2到50之间' })
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
   * 排序值
   */
  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  sort?: number;

  /**
   * 配置状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}
