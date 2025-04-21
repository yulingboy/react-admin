import { IsString, IsOptional, IsEnum, IsInt, Min, IsDateString, IsArray } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询账单DTO
 * 继承分页DTO，添加账单查询特有的参数
 */
export class QueryBillDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索备注内容)
   */
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  keyword?: string;

  /**
   * 状态筛选
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 账单类型筛选
   */
  @IsOptional()
  @IsEnum(['income', 'expense', 'transfer', ''], { message: '账单类型必须是income、expense、transfer或空' })
  type?: string;

  /**
   * 账户ID筛选
   */
  @IsOptional()
  @IsInt({ message: '账户ID必须是整数' })
  @Min(1, { message: '账户ID必须大于0' })
  accountId?: number;

  /**
   * 分类ID筛选
   */
  @IsOptional()
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  categoryId?: number;

  /**
   * 标签ID筛选
   */
  @IsOptional()
  @IsInt({ message: '标签ID必须是整数' })
  @Min(1, { message: '标签ID必须大于0' })
  tagId?: number;

  /**
   * 开始日期
   */
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  /**
   * 结束日期
   */
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  /**
   * 最小金额
   */
  @IsOptional()
  @IsInt({ message: '最小金额必须是整数' })
  @Min(0, { message: '最小金额不能小于0' })
  minAmount?: number;

  /**
   * 最大金额
   */
  @IsOptional()
  @IsInt({ message: '最大金额必须是整数' })
  @Min(0, { message: '最大金额不能小于0' })
  maxAmount?: number;

  /**
   * 排序字段
   */
  @IsOptional()
  @IsEnum(['billDate', 'amount', 'createdAt'], { message: '排序字段不合法' })
  sortField?: string = 'billDate';

  /**
   * 排序方向
   */
  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: '排序方向必须是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}