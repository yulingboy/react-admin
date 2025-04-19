import { IsOptional, IsString, IsDateString, IsInt, Min, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ApiMonitorQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;
  
  @IsOptional()
  @IsString()
  sortBy?: string;
  
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
  
  @IsOptional()
  @IsInt()
  @Min(100)
  minResponseTime?: number;
  
  @IsOptional()
  @IsBoolean()
  onlyErrors?: boolean;
  
  @IsOptional()
  @IsString()
  userAgent?: string;
  
  @IsOptional()
  @IsString()
  ip?: string;
}

export class ApiRecordDto {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  contentLength?: number;
  responseSize?: number;
  userId?: number;
  userAgent?: string;
  ip?: string;
  errorMessage?: string;
}

export class ApiPerformanceQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number = 7;
  
  @IsOptional()
  @IsBoolean()
  detailed?: boolean = false;
  
  @IsOptional()
  @IsArray()
  paths?: string[];
  
  @IsOptional()
  @IsString()
  format?: 'hourly' | 'daily' = 'daily';
}

export class ApiExportQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
  
  @IsOptional()
  @IsString()
  format?: 'csv' | 'json' | 'excel' = 'csv';
  
  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean = false;
}

export class ApiAlertConfigDto {
  @IsOptional()
  @IsInt()
  id?: number;
  
  @IsOptional()
  @IsString()
  path?: string;
  
  @IsInt()
  @Min(0)
  @Type(() => Number)
  responseTimeThreshold: number = 1000; // 毫秒
  
  @IsInt()
  @Min(0)
  @Type(() => Number)
  errorRateThreshold: number = 5; // 百分比
  
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean = true;
}
