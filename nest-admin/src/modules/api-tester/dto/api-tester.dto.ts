import { IsString, IsEnum, IsArray, IsOptional, IsObject, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 定义HTTP方法枚举
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

// 请求内容类型枚举
export enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
  XML = 'application/xml',
  TEXT = 'text/plain'
}

// 请求头项DTO
export class HeaderItemDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsBoolean()
  enabled: boolean;
}

// 请求参数项DTO
export class ParamItemDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  enabled: boolean;
}

// 接口测试请求DTO
export class ApiTestRequestDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  url: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeaderItemDto)
  headers: HeaderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamItemDto)
  @IsOptional()
  params?: ParamItemDto[];

  @IsObject()
  @IsOptional()
  body?: any;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  timeout?: number;

  @IsBoolean()
  @IsOptional()
  saveToHistory?: boolean;
}

// 接口测试历史查询参数DTO
export class ApiTestHistoryQueryDto {
  @IsNumber({}, { message: '页码必须是数字' })
  @IsOptional()
  // 转换为数字类型
  @Type(() => Number)
  current?: number;

  @IsNumber({}, { message: '每页条数必须是数字' })
  @IsOptional()
  // 转换为数字类型
  @Type(() => Number)
  pageSize?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(HttpMethod)
  @IsOptional()
  method?: HttpMethod;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}

// 接口测试模板创建DTO
export class ApiTestTemplateCreateDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeaderItemDto)
  headers: HeaderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamItemDto)
  @IsOptional()
  params?: ParamItemDto[];

  @IsObject()
  @IsOptional()
  body?: any;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsString()
  @IsOptional()
  description?: string;
}

// 接口测试模板更新DTO
export class ApiTestTemplateUpdateDto extends ApiTestTemplateCreateDto { }