import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * 查询通知DTO
 * 继承分页DTO，添加通知查询特有的参数
 */
export class QueryNotificationDto extends PaginationDto {
  /**
   * 关键字搜索
   */
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  keyword?: string;

  /**
   * 通知类型
   */
  @IsOptional()
  @IsString({ message: '通知类型必须是字符串' })
  type?: string;
}