import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 查询角色DTO
 * 继承分页DTO，添加角色查询特有的参数
 */
export class QueryRoleDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索角色名称和标识)
   */
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  keyword?: string;

  /**
   * 是否系统内置角色筛选
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '是否系统内置角色值必须是有效的枚举值' })
  isSystem?: string;

  /**
   * 角色状态筛选
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}
