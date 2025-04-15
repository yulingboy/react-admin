import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum,  } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// 数据库类型枚举
export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  MSSQL = 'mssql',
  MARIADB = 'mariadb',
  SQLITE = 'sqlite',
}

// 创建数据库连接DTO
export class CreateDatabaseConnectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DatabaseType)
  @IsNotEmpty()
  type: DatabaseType;

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

  @IsString()
  @IsOptional()
  status?: string = '1';
}

// 更新数据库连接DTO
export class UpdateDatabaseConnectionDto extends CreateDatabaseConnectionDto {}

// 查询数据库连接参数DTO
export class QueryDatabaseConnectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DatabaseType)
  @IsOptional()
  type?: DatabaseType;

  @IsString()
  @IsOptional()
  status?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  current?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize?: number = 10;
}

// 测试连接DTO
export class TestConnectionDto extends CreateDatabaseConnectionDto {}

// 执行SQL查询DTO
export class ExecuteSqlDto {
  @IsString()
  @IsNotEmpty()
  sql: string;
}