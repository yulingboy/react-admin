import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 执行SQL查询DTO
 * 包含要执行的SQL语句
 */
export class ExecuteSqlDto {
  /** SQL语句 */
  @IsString()
  @IsNotEmpty()
  sql: string;
}

/**
 * 表数据查询DTO
 * 用于查询表数据时的分页参数
 */
export class TableDataQueryDto {
  /** 页码 */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value) || 1)
  page?: number = 1;

  /** 每页条数 */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value) || 100)
  pageSize?: number = 100;
}

/**
 * 表字段结构DTO
 * 描述表中字段的结构信息
 */
export class TableColumnDto {
  /** 字段名 */
  name: string;
  
  /** 字段类型 */
  type: string;
  
  /** 是否可为空 */
  nullable: boolean;
  
  /** 默认值 */
  default?: any;
  
  /** 注释 */
  comment?: string;
  
  /** 是否为主键 */
  isPrimary: boolean;
  
  /** 是否唯一 */
  isUnique: boolean;
  
  /** 是否索引 */
  isIndex: boolean;
  
  /** 是否外键 */
  isForeign: boolean;
}

/**
 * 查询结果DTO
 * 包含查询结果和字段信息
 */
export class QueryResultDto {
  /** 字段信息 */
  fields: { name: string; type: string }[];
  
  /** 数据行 */
  rows: any[];
  
  /** 记录数 */
  rowCount: number;
  
  /** 执行时间(毫秒) */
  executionTime?: number;
}
