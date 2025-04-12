import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询角色DTO
 * 继承分页DTO，添加角色查询特有的参数
 */
export class QueryRoleDto extends PaginationDto {
  /**
   * 角色标识关键字搜索
   */
  @IsOptional()
  @IsString({ message: '角色标识必须是字符串' })
  key?: string;

  /**
   * 角色名称关键字搜索
   */
  @IsOptional()
  @IsString({ message: '角色名必须是字符串' })
  name?: string;

  /**
   * 角色状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}
