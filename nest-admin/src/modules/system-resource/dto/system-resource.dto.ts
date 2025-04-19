import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SystemResourcesQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;
}
