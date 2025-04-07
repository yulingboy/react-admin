import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询角色DTO
 * 继承分页DTO，添加角色查询特有的参数
 */
export class QueryRoleDto extends PaginationDto {
  /**
   * 角色名称关键字搜索
   */
  @IsOptional()
  @IsString({ message: '角色名必须是字符串' })
  name?: string;

  /**
   * 角色状态筛选
   */
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Transform(({ value }) => value ? Number(value) : undefined)
  status?: number;
}
