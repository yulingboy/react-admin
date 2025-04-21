import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询账单标签DTO
 * 继承分页DTO，添加账单标签查询特有的参数
 */
export class QueryBillTagDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索标签名称)
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
}