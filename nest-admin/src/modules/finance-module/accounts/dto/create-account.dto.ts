import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { StatusEnum } from 'src/common/enums/common.enum';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * 创建账户DTO
 * 定义创建账户需要的参数
 */
export class CreateAccountDto {
  /**
   * 账户名称
   */
  @IsString({ message: '账户名称必须是字符串' })
  @MinLength(2, { message: '账户名称长度不能小于2' })
  @MaxLength(50, { message: '账户名称长度不能大于50' })
  name: string;

  /**
   * 账户类型ID
   */
  @IsInt({ message: '账户类型ID必须是整数' })
  @Min(1, { message: '账户类型ID必须大于0' })
  typeId: number;

  /**
   * 账户余额
   * 支持整数和小数（最多2位小数）
   */
  @Transform(({ value }) => {
    try {
      // 处理不同类型的输入值
      if (typeof value === 'string') {
        // 如果是字符串形式的整数，转为带小数点的形式
        if (/^\d+$/.test(value)) {
          value = `${value}.00`;
        }
      } else if (typeof value === 'number') {
        // 如果是数字类型，确保它被转换为字符串
        value = value.toString();
        if (!value.includes('.')) {
          value = `${value}.00`;
        }
      }
      return new Decimal(value);
    } catch (error) {
      console.error("余额转换错误:", error, "输入值:", value, "类型:", typeof value);
      // 返回原始值，让验证器处理错误
      return value;
    }
  })
  @IsNumber({}, { message: '余额必须是数字' })
  @Type(() => Number)
  balance: Decimal;

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
   * this is not from user,
   * is set by server
   */
  userId?: number;

  /**
   * 状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;
  
  /**
   * 是否默认账户
   */
  @IsOptional()
  @IsEnum(['0', '1'], { message: '是否默认账户值必须是有效的枚举值' })
  isDefault?: string = '0';

  /**
   * 排序，默认为0
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number = 0;
}