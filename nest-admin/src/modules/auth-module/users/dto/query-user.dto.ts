import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { IsSystemEnum, StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询用户DTO
 * 继承分页DTO，添加用户查询特有的参数
 */
export class QueryUserDto extends PaginationDto {
  /**
   * 关键字搜索
   */
  @IsOptional()
  @IsString({ message: '关键字必须是字符串' })
  keyword?: string;

  /**
   * 是否系统内置用户筛选
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '是否系统内置用户值必须是有效的枚举值' })
  isSystem?: string;

  /**
   * 用户状态筛选
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 角色ID筛选
   */
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  roleId?: number;
}
