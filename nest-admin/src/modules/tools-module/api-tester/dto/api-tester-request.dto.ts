import { IsString, IsEnum, IsArray, IsOptional, IsObject, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpMethod, ContentType } from './api-tester.enum';
import { HeaderItemDto, ParamItemDto } from './api-tester-common.dto';

/**
 * 接口测试请求DTO
 * 用于验证和定义API测试请求的完整数据结构
 */
export class ApiTestRequestDto {
  @IsNumber()
  @IsOptional()
  id?: number;           // 请求ID，用于保存模板时的标识

  @IsString()
  @IsOptional()
  name?: string;         // 请求名称，用于保存模板或历史记录

  @IsString()
  url: string;           // 请求URL地址

  @IsEnum(HttpMethod)
  method: HttpMethod;    // 请求方法

  @IsArray()
  @ValidateNested({ each: true })  // 验证数组中的每个对象
  @Type(() => HeaderItemDto)       // 指定数组元素类型转换
  headers: HeaderItemDto[];        // 请求头数组

  @IsArray()
  @ValidateNested({ each: true })  // 验证数组中的每个对象
  @Type(() => ParamItemDto)        // 指定数组元素类型转换
  @IsOptional()
  params?: ParamItemDto[];         // 请求参数数组（可选）

  @IsObject()
  @IsOptional()
  body?: any;            // 请求体内容（可选）

  @IsEnum(ContentType)
  contentType: ContentType;  // 请求内容类型

  @IsString()
  @IsOptional()
  description?: string;  // 请求描述（可选）

  @IsNumber()
  @IsOptional()
  timeout?: number;      // 请求超时时间（毫秒，可选）

  @IsBoolean()
  @IsOptional()
  saveToHistory?: boolean; // 是否保存到历史记录（可选）
}