import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询用户DTO
 * 继承分页DTO，添加用户查询特有的参数
 */
export class QueryUserDto extends PaginationDto {
  /**
   * 用户名关键字搜索
   */
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  /**
   * 电子邮箱关键字搜索
   */
  @IsOptional()
  @IsString({ message: '邮箱必须是字符串' })
  email?: string;

  /**
   * 用户状态筛选
   */
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Transform(({ value }) => value ? Number(value) : undefined)
  status?: number;

  /**
   * 角色ID筛选
   */
  @IsOptional()
  @IsInt({ message: '角色ID必须是整数' })
  @Min(1, { message: '角色ID必须大于0' })
  @Transform(({ value }) => value ? Number(value) : undefined)
  roleId?: number;
}
