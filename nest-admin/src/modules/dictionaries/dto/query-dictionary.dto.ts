import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询字典DTO
 * 继承分页DTO，添加字典查询特有的参数
 */
export class QueryDictionaryDto extends PaginationDto {
  /**
   * 字典编码（模糊查询）
   */
  @IsOptional()
  @IsString({ message: '字典编码必须是字符串' })
  code?: string;

  /**
   * 字典名称（模糊查询）
   */
  @IsOptional()
  @IsString({ message: '字典名称必须是字符串' })
  name?: string;

  /**
   * 字典状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}