import { IsOptional, IsString } from 'class-validator';

/**
 * 查询定时任务DTO
 * 用于查询和筛选定时任务列表
 */
export class QueryScheduleJobDto {
  @IsOptional()
  @IsString({ message: '任务名称必须是字符串' })
  jobName?: string;

  @IsOptional()
  @IsString({ message: '任务组名必须是字符串' })
  jobGroup?: string;

  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}