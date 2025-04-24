import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 查询配置DTO
 * 继承分页DTO，添加配置查询特有的参数
 */
export class QueryConfigDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索配置键名和描述)
   */
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  keyword?: string;

  /**
   * 是否系统内置配置筛选
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '是否系统内置配置值必须是有效的枚举值' })
  isSystem?: string;

  /**
   * 配置状态筛选
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}
