import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 查询账单分类DTO
 * 继承分页DTO，添加账单分类查询特有的参数
 */
export class QueryBillCategoryDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索分类名称)
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
   * 是否系统内置筛选
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '是否系统内置值必须是有效的枚举值' })
  isSystem?: string;

  /**
   * 分类类型筛选(income: 收入, expense: 支出)
   */
  @IsOptional()
  @IsEnum(['income', 'expense', ''], { message: '分类类型必须是income、expense或空' })
  type?: string;

  /**
   * 父级分类ID筛选
   */
  @IsOptional()
  @IsInt({ message: '父级分类ID必须是整数' })
  @Min(0, { message: '父级分类ID不能小于0' })
  parentId?: number;
}