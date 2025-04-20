import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * 查询代码生成器DTO
 * 继承分页DTO，添加代码生成器查询特有的参数
 */
export class QueryCodeGeneratorDto extends PaginationDto {
  /**
   * 名称关键字搜索
   */
  @IsOptional()
  @IsString({ message: '名称必须是字符串' })
  name?: string;

  /**
   * 表名称关键字搜索
   */
  @IsOptional()
  @IsString({ message: '表名称必须是字符串' })
  tableName?: string;
}