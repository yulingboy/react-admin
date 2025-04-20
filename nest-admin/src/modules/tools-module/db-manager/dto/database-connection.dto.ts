import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseDatabaseConnectionDto, DatabaseType, NetworkDatabasePropsDto, SqliteDatabasePropsDto } from './database-types.dto';

/**
 * 创建数据库连接DTO
 * 结合基础属性和各类数据库特定属性
 */
export class CreateDatabaseConnectionDto extends BaseDatabaseConnectionDto {
  @IsString()
  @IsOptional()
  host?: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  database: string;

  @IsString()
  @IsOptional()
  filename?: string;

  @IsBoolean()
  @IsOptional()
  ssl?: boolean;
}

/**
 * 更新数据库连接DTO
 * 继承创建DTO的所有属性
 */
export class UpdateDatabaseConnectionDto extends CreateDatabaseConnectionDto {}

/**
 * 查询数据库连接参数DTO
 * 用于列表查询和过滤
 */
export class QueryDatabaseConnectionDto {
  /** 按名称过滤 */
  @IsString()
  @IsOptional()
  name?: string;

  /** 按数据库类型过滤 */
  @IsEnum(DatabaseType)
  @IsOptional()
  type?: DatabaseType;

  /** 按状态过滤 */
  @IsString()
  @IsOptional()
  status?: string;

  /** 当前页码 */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  current?: number = 1;

  /** 每页条数 */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize?: number = 10;
}

/**
 * 测试连接DTO
 * 用于测试数据库连接的有效性
 */
export class TestConnectionDto extends CreateDatabaseConnectionDto {}

export { DatabaseType };
