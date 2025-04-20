import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { TestConnectionDto } from '../../dto/database-connection.dto';
import { QueryResultDto, TableColumnDto } from '../../dto/database-operation.dto';

/**
 * MySQL数据库提供者服务
 * 负责处理MySQL/MariaDB相关的数据库操作
 */
@Injectable()
export class MysqlProviderService {
  /**
   * 测试MySQL数据库连接
   * @param connectionData 连接数据
   */
  async testConnection(connectionData: TestConnectionDto): Promise<void> {
    const { host, port, username, password, database, ssl } = connectionData;
    
    const connection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    await connection.connect();
    await connection.end();
  }

  /**
   * 获取MySQL数据库表列表
   * @param connection 连接配置
   * @returns 表列表
   */
  async getTables(connection: any): Promise<any[]> {
    const { host, port, username, password, database, ssl } = connection;
    
    const mysqlConnection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    const [rows] = await mysqlConnection.query(`
      SELECT 
        TABLE_NAME AS name,
        TABLE_COMMENT AS comment,
        ENGINE AS engine,
        TABLE_COLLATION AS collation,
        (DATA_LENGTH + INDEX_LENGTH) AS size,
        TABLE_ROWS AS \`rows\`
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [database]);
    
    await mysqlConnection.end();
    
    return rows as any[];
  }

  /**
   * 获取MySQL表结构
   * @param connection 连接配置
   * @param tableName 表名
   * @returns 表结构信息
   */
  async getTableStructure(connection: any, tableName: string): Promise<TableColumnDto[]> {
    const { host, port, username, password, database, ssl } = connection;
    
    const mysqlConnection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    // 获取列信息
    const [columns] = await mysqlConnection.query(`
      SELECT 
        COLUMN_NAME AS name, 
        COLUMN_TYPE AS type,
        IS_NULLABLE = 'YES' AS nullable,
        COLUMN_DEFAULT AS \`default\`,
        COLUMN_COMMENT AS comment,
        COLUMN_KEY = 'PRI' AS isPrimary,
        COLUMN_KEY = 'UNI' AS isUnique,
        COLUMN_KEY IN ('MUL', 'UNI', 'PRI') AS isIndex,
        FALSE AS isForeign
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [database, tableName]);
    
    // 获取外键信息
    const [foreignKeys] = await mysqlConnection.query(`
      SELECT 
        COLUMN_NAME AS column_name
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? 
        AND REFERENCED_TABLE_SCHEMA IS NOT NULL
    `, [database, tableName]);
    
    await mysqlConnection.end();
    
    // 标记外键 - 确保foreignKeys是数组
    const fkColumns = Array.isArray(foreignKeys) ? 
      foreignKeys.map((fk: any) => fk.column_name) : [];
    
    return (columns as any[]).map(col => ({
      ...col,
      isForeign: fkColumns.includes(col.name)
    }));
  }

  /**
   * 执行MySQL查询
   * @param connection 连接配置
   * @param sql SQL语句
   * @returns 查询结果
   */
  async executeQuery(connection: any, sql: string): Promise<QueryResultDto> {
    const { host, port, username, password, database, ssl } = connection;
    
    const mysqlConnection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    try {
      const [rows, fields] = await mysqlConnection.query(sql);
      
      return {
        fields: fields?.map((field: any) => ({
          name: field.name,
          type: field.type,
        })) || [],
        rows: Array.isArray(rows) ? rows : [rows],
        rowCount: Array.isArray(rows) ? rows.length : 1,
      };
    } finally {
      await mysqlConnection.end();
    }
  }
}
