import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';




export class LogStatsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  level?: string;
}