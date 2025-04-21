import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 更新账单分类DTO
 * 定义更新账单分类需要的参数
 */
export class UpdateBillCategoryDto {
  /**
   * 分类ID
   */
  @IsInt({ message: '分类ID必须是整数' })
  @Min(1, { message: '分类ID必须大于0' })
  @Max(999999, { message: '分类ID不能大于999999' })
  id: number;

  /**
   * 分类名称
   */
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  @MinLength(2, { message: '分类名称长度不能小于2' })
  @MaxLength(50, { message: '分类名称长度不能大于50' })
  name?: string;

  /**
   * 分类图标
   */
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  @MaxLength(100, { message: '图标长度不能大于100' })
  icon?: string;

  /**
   * 分类颜色
   */
  @IsOptional()
  @IsString({ message: '颜色必须是字符串' })
  @MaxLength(20, { message: '颜色长度不能大于20' })
  color?: string;

  /**
   * 分类类型(income: 收入, expense: 支出)
   */
  @IsOptional()
  @IsEnum(['income', 'expense'], { message: '分类类型必须是income或expense' })
  type?: string;

  /**
   * 父级分类ID
   */
  @IsOptional()
  @IsInt({ message: '父级分类ID必须是整数' })
  @Min(0, { message: '父级分类ID不能小于0' })
  parentId?: number;

  /**
   * 描述
   */
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述长度不能大于200' })
  description?: string;

  /**
   * 状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 是否系统内置
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统内置值必须是有效的枚举值' })
  isSystem?: string;

  /**
   * 排序
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number;
}