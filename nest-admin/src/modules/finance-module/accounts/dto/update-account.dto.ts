import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum, IsDecimal } from 'class-validator';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 更新账户DTO
 * 定义更新账户需要的参数
 */
export class UpdateAccountDto {
  /**
   * 账户ID
   */
  @IsInt({ message: '账户ID必须是整数' })
  @Min(1, { message: '账户ID必须大于0' })
  @Max(999999, { message: '账户ID不能大于999999' })
  id: number;

  /**
   * 账户名称
   */
  @IsOptional()
  @IsString({ message: '账户名称必须是字符串' })
  @MinLength(2, { message: '账户名称长度不能小于2' })
  @MaxLength(50, { message: '账户名称长度不能大于50' })
  name?: string;

  /**
   * 账户类型ID
   */
  @IsOptional()
  @IsInt({ message: '账户类型ID必须是整数' })
  @Min(1, { message: '账户类型ID必须大于0' })
  typeId?: number;

  /**
   * 账户余额
   */
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' }, { message: '余额必须是数字，最多2位小数' })
  balance?: number;

  /**
   * 图标
   */
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  @MaxLength(100, { message: '图标长度不能大于100' })
  icon?: string;

  /**
   * 颜色
   */
  @IsOptional()
  @IsString({ message: '颜色必须是字符串' })
  @MaxLength(20, { message: '颜色长度不能大于20' })
  color?: string;

  /**
   * 状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
  
  /**
   * 是否默认账户
   */
  @IsOptional()
  @IsEnum(['0', '1'], { message: '是否默认账户值必须是有效的枚举值' })
  isDefault?: string;

  /**
   * 排序
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number;
}