import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/common.enum';

export class QueryConfigDto extends PaginationDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  group?: string;

  /**
   * 配置状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;
}
