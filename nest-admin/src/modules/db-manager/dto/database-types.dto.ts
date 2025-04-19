import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

/**
 * 数据库类型枚举
 * 定义支持的所有数据库类型
 */
export enum DatabaseType {
  /** MySQL数据库 */
  MYSQL = 'mysql',
  /** PostgreSQL数据库 */
  POSTGRES = 'postgres',
  /** Microsoft SQL Server数据库 */
  MSSQL = 'mssql',
  /** MariaDB数据库 */
  MARIADB = 'mariadb',
  /** SQLite数据库 */
  SQLITE = 'sqlite',
}

/**
 * 基础数据库连接DTO
 * 包含所有数据库类型共有的基础属性
 */
export class BaseDatabaseConnectionDto {
  /** 连接名称 */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** 数据库类型 */
  @IsEnum(DatabaseType)
  @IsNotEmpty()
  type: DatabaseType;

  /** 连接状态：1-启用，0-禁用 */
  @IsString()
  @IsOptional()
  status?: string = '1';
}

/**
 * 网络数据库连接属性DTO
 * 适用于需要网络连接的数据库类型(MySQL, PostgreSQL, MS SQL, MariaDB)
 */
export class NetworkDatabasePropsDto {
  /** 主机地址 */
  @IsString()
  @IsOptional()
  host?: string;

  /** 端口号 */
  @IsNumber()
  @IsOptional()
  port?: number;

  /** 用户名 */
  @IsString()
  @IsOptional()
  username?: string;

  /** 密码 */
  @IsString()
  @IsOptional()
  password?: string;

  /** 数据库名称 */
  @IsString()
  @IsNotEmpty()
  database: string;

  /** 是否使用SSL连接 */
  @IsBoolean()
  @IsOptional()
  ssl?: boolean;
}

/**
 * SQLite数据库属性DTO
 * 适用于SQLite数据库类型
 */
export class SqliteDatabasePropsDto {
  /** 数据库名称 */
  @IsString()
  @IsNotEmpty()
  database: string;
  
  /** SQLite文件路径 */
  @IsString()
  @IsNotEmpty()
  filename: string;
}
