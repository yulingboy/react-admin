import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 创建账户类型DTO
 * 定义创建账户类型需要的参数
 */
export class CreateAccountTypeDto {
  /**
   * 账户类型名称：如"支付宝"、"微信"、"银行卡"等
   */
  @IsString({ message: '账户类型名称必须是字符串' })
  @MinLength(2, { message: '账户类型名称长度不能小于2' })
  @MaxLength(50, { message: '账户类型名称长度不能大于50' })
  name: string;

  /**
   * 图标
   */
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  @MaxLength(100, { message: '图标长度不能大于100' })
  icon?: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述长度不能大于200' })
  description?: string;

  /**
   * 状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;
  
  /**
   * 是否系统内置，默认为否
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统内置值必须是有效的枚举值' })
  isSystem?: string = IsSystemEnum.NO;

  /**
   * 排序，默认为0
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number = 0;
}