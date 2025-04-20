import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * 查询登录日志DTO
 */
export class QueryLoginLogDto extends PaginationDto {
  @IsOptional()
  @IsString()
  username?: string; // 用户名

  @IsOptional()
  @IsString()
  ipAddress?: string; // IP地址

  @IsOptional()
  @IsString()
  status?: string; // 状态（0失败 1成功）

  @IsOptional()
  @IsDateString()
  startTime?: string; // 开始时间

  @IsOptional()
  @IsDateString()
  endTime?: string; // 结束时间
}