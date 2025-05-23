import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsInt, Min, Max, Length } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 创建配置DTO
 * 定义创建配置需要的参数
 */
export class CreateConfigDto {
  /**
   * 配置键名
   */
  @IsString({ message: '配置键名必须是字符串' })
  @Length(2, 50, { message: '配置键名长度必须在2到50之间' })
  key: string;

  /**
   * 配置值
   */
  @IsString({ message: '配置值必须是字符串' })
  value: string;

  /**
   * 配置描述
   */
  @IsOptional()
  @IsString({ message: '配置描述必须是字符串' })
  @MaxLength(200, { message: '配置描述长度不能大于200' })
  description?: string;

  /**
   * 配置类型，默认为string
   */
  @IsOptional()
  @IsString({ message: '配置类型必须是字符串' })
  type?: string = 'string';

  /**
   * 排序值
   */
  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  sort?: number = 0;

  /**
   * 配置状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;
}
