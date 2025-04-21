import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 查询账户DTO
 * 继承分页DTO，添加账户查询特有的参数
 */
export class QueryAccountDto extends PaginationDto {
  /**
   * 关键字搜索(可搜索账户名称)
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

  /**
   * 账户类型ID筛选
   */
  @IsOptional()
  @IsInt({ message: '账户类型ID必须是整数' })
  @Min(1, { message: '账户类型ID必须大于0' })
  typeId?: number;
  
  /**
   * 是否默认账户筛选
   */
  @IsOptional()
  @IsEnum(['0', '1'], { message: '是否默认账户值必须是有效的枚举值' })
  isDefault?: string;
}