import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsInt, Min, Max, IsNumber, IsArray, IsDateString, IsNotEmpty } from 'class-validator';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 创建账单DTO
 * 定义创建账单需要的参数
 */
export class CreateBillDto {
  /**
   * 账单类型(income: 收入, expense: 支出, transfer: 转账)
   */
  @IsEnum(['income', 'expense', 'transfer'], { message: '账单类型必须是income、expense或transfer' })
  type: string;

  /**
   * 账单金额
   */
  @IsNumber({}, { message: '金额必须是数字' })
  @Min(0.01, { message: '金额必须大于0.01' })
  amount: number;

  /**
   * 账单日期
   */
  @IsDateString({}, { message: '账单日期格式不正确' })
  billDate: string;

  /**
   * 账户ID
   */
  @IsInt({ message: '账户ID必须是整数' })
  @Min(1, { message: '账户ID必须大于0' })
  accountId: number;

  /**
   * 分类ID (收入和支出类型必填)
   */
  @IsOptional()
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  categoryId?: number;

  /**
   * 目标账户ID (转账类型必填)
   */
  @IsOptional()
  @IsInt({ message: '目标账户ID必须是整数' })
  @Min(1, { message: '目标账户ID必须大于0' })
  targetAccountId?: number;

  /**
   * 标签ID数组
   */
  @IsOptional()
  @IsArray({ message: 'tagIds必须是数组' })
  @IsInt({ each: true, message: '每个标签ID必须是整数' })
  tagIds?: number[];

  /**
   * 备注
   */
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注长度不能大于500' })
  remark?: string;

  /**
   * 图片列表(JSON字符串)
   */
  @IsOptional()
  @IsString({ message: '图片列表必须是字符串' })
  images?: string;

  /**
   * 位置信息
   */
  @IsOptional()
  @IsString({ message: '位置信息必须是字符串' })
  @MaxLength(200, { message: '位置信息长度不能大于200' })
  location?: string;

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
}