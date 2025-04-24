import { IsNotEmpty, IsString, IsOptional, Matches, IsIn } from 'class-validator';

/**
 * 更新定时任务DTO
 * 用于更新已存在的定时任务
 */
export class UpdateScheduleJobDto {
  @IsNotEmpty({ message: '任务ID不能为空' })
  id: number;
  
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString({ message: '任务名称必须是字符串' })
  jobName: string;

  @IsOptional()
  @IsString({ message: '任务组名必须是字符串' })
  jobGroup?: string;

  @IsNotEmpty({ message: '调用目标不能为空' })
  @IsString({ message: '调用目标必须是字符串' })
  invokeTarget: string;

  @IsNotEmpty({ message: 'Cron表达式不能为空' })
  @IsString({ message: 'Cron表达式必须是字符串' })
  @Matches(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/, { message: 'Cron表达式格式不正确' })
  cronExpression: string;

  @IsOptional()
  @IsString({ message: '计划执行错误策略必须是字符串' })
  @IsIn(['1', '2', '3'], { message: '计划执行错误策略值不正确' })
  misfirePolicy?: string;

  @IsOptional()
  @IsString({ message: '是否并发执行必须是字符串' })
  @IsIn(['0', '1'], { message: '是否并发执行值不正确' })
  concurrent?: string;

  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  @IsIn(['0', '1'], { message: '状态值不正确' })
  status?: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}