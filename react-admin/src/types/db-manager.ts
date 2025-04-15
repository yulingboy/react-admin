// 数据库类型枚举
export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  MSSQL = 'mssql',
  MARIADB = 'mariadb',
  SQLITE = 'sqlite',
}

// 数据库连接配置
export interface DatabaseConnection {
  id: number;
  name: string;        // 连接名称
  type: DatabaseType;  // 数据库类型
  host?: string;       // 主机地址
  port?: number;       // 端口
  username?: string;   // 用户名
  password?: string;   // 密码
  database: string;    // 数据库名
  filename?: string;   // SQLite文件路径
  status: string;      // 状态：0-禁用，1-启用
  isSystem: string;    // 是否为系统内置：0-否，1-是
  ssl?: boolean;       // 是否启用SSL
  createdAt?: string;
  updatedAt?: string;
}

// 数据库表信息
export interface DatabaseTable {
  name: string;        // 表名
  comment?: string;    // 表注释
  schema?: string;     // 架构(PostgreSQL)
  size?: number;       // 表大小
  rows?: number;       // 行数
  engine?: string;     // 引擎(MySQL)
  collation?: string;  // 排序规则
}

// 数据库列信息
export interface DatabaseColumn {
  name: string;        // 列名
  type: string;        // 数据类型
  nullable: boolean;   // 是否可为空
  default?: string;    // 默认值
  comment?: string;    // 列注释
  isPrimary: boolean;  // 是否为主键
  isUnique: boolean;   // 是否唯一
  isIndex: boolean;    // 是否索引
  isForeign: boolean;  // 是否外键
}

// 查询结果
export interface QueryResult {
  fields: Array<{
    name: string;
    type: string;
  }>;
  rows: any[];
  rowCount: number;
  executionTime: number;
}

// 数据库连接列表查询参数
export interface DatabaseConnectionListParams {
  name?: string;
  type?: DatabaseType;
  status?: string;
  current: number;
  pageSize: number;
}