import { IsString, IsEnum, IsArray, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HttpMethod, ContentType } from './api-tester.enum';
import { HeaderItemDto, ParamItemDto } from './api-tester-common.dto';

/**
 * 接口测试模板创建DTO
 * 用于验证和定义创建API测试模板的数据结构
 */
export class ApiTestTemplateCreateDto {
  @IsString()
  name: string;         // 模板名称

  @IsString()
  url: string;          // 请求URL地址

  @IsEnum(HttpMethod)
  method: HttpMethod;   // 请求方法

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeaderItemDto)
  headers: HeaderItemDto[]; // 请求头数组

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParamItemDto)
  @IsOptional()
  params?: ParamItemDto[]; // 请求参数数组（可选）

  @IsObject()
  @IsOptional()
  body?: any;             // 请求体内容（可选）

  @IsEnum(ContentType)
  contentType: ContentType; // 请求内容类型

  @IsString()
  @IsOptional()
  description?: string;   // 模板描述（可选）
}

/**
 * 接口测试模板更新DTO
 * 继承创建DTO，用于更新API测试模板
 */
export class ApiTestTemplateUpdateDto extends ApiTestTemplateCreateDto { }