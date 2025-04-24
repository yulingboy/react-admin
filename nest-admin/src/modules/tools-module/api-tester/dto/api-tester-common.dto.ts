import { IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * 请求头项DTO
 * 用于验证和定义API测试请求头部的数据结构
 */
export class HeaderItemDto {
  @IsString()
  key: string;     // 请求头名称

  @IsString()
  value: string;   // 请求头值

  @IsBoolean()
  enabled: boolean; // 是否启用该请求头
}

/**
 * 请求参数项DTO
 * 用于验证和定义API测试URL参数的数据结构
 */
export class ParamItemDto {
  @IsString()
  key: string;     // 参数名称

  @IsString()
  value: string;   // 参数值

  @IsString()
  @IsOptional()
  description?: string; // 参数描述（可选）

  @IsBoolean()
  enabled: boolean; // 是否启用该参数
}