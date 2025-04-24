import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpMethod } from './api-tester.enum';

/**
 * 接口测试历史查询参数DTO
 * 用于验证和定义查询API测试历史记录的参数
 */
export class ApiTestHistoryQueryDto {
  @IsNumber({}, { message: '页码必须是数字' })
  @IsOptional()
  // 转换为数字类型
  @Type(() => Number)
  current?: number;       // 当前页码

  @IsNumber({}, { message: '每页条数必须是数字' })
  @IsOptional()
  // 转换为数字类型
  @Type(() => Number)
  pageSize?: number;      // 每页条数

  @IsString()
  @IsOptional()
  name?: string;          // 请求名称（模糊搜索）

  @IsEnum(HttpMethod)
  @IsOptional()
  method?: HttpMethod;    // HTTP请求方法

  @IsString()
  @IsOptional()
  url?: string;           // 请求URL（模糊搜索）

  @IsString()
  @IsOptional()
  startTime?: string;     // 开始时间

  @IsString()
  @IsOptional()
  endTime?: string;       // 结束时间
}