import { IsInt, Min, Max, IsDecimal, IsString, MaxLength, IsOptional, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * 调整账户余额DTO
 */
export class AdjustBalanceDto {
  /**
   * 账户ID
   */
  @IsInt({ message: '账户ID必须是整数' })
  @Min(1, { message: '账户ID必须大于0' })
  @Max(999999, { message: '账户ID不能大于999999' })
  id: number;

  /**
   * 调整后的余额
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
      return value;
    } catch (error) {
      console.error("余额转换错误:", error, "输入值:", value, "类型:", typeof value);
      // 返回原始值，让验证器处理错误
      return value;
    }
  })
  @IsDecimal({ decimal_digits: '0,2' }, { message: '余额必须是数字，最多2位小数' })
  balance: number | string | Decimal;

  /**
   * 调整原因
   */
  @IsOptional()
  @IsString({ message: '调整原因必须是字符串' })
  @MaxLength(200, { message: '调整原因长度不能大于200' })
  reason?: string;
}