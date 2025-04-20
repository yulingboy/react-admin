import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

/**
 * 查询操作日志DTO
 */
export class QueryOperLogDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string; // 操作模块

  @IsOptional()
  @IsString()
  operName?: string; // 操作人员

  @IsOptional()
  @IsString()
  businessType?: string; // 业务类型（0其它 1新增 2修改 3删除）

  @IsOptional()
  @IsString()
  status?: string; // 操作状态（0正常 1异常）

  @IsOptional()
  @IsDateString()
  startTime?: string; // 开始时间

  @IsOptional()
  @IsDateString()
  endTime?: string; // 结束时间
}