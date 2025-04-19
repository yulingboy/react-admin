import { Injectable } from '@nestjs/common';
import * as pg from 'pg';
import { TestConnectionDto } from '../../dto/database-connection.dto';
import { QueryResultDto, TableColumnDto } from '../../dto/database-operation.dto';

/**
 * PostgreSQL数据库提供者服务
 * 负责处理PostgreSQL相关的数据库操作
 */
@Injectable()
export class PostgresProviderService {
  /**
   * 测试PostgreSQL数据库连接
   * @param connectionData 连接数据
   */
  async testConnection(connectionData: TestConnectionDto): Promise<void> {
    const { host, port, username, password, database, ssl } = connectionData;
    
    const client = new pg.Client({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    await client.connect();
    await client.end();
  }

  /**
   * 获取PostgreSQL数据库表列表
   * @param connection 连接配置
   * @returns 表列表
   */
  async getTables(connection: any): Promise<any[]> {
    const { host, port, username, password, database, ssl } = connection;
    
    const client = new pg.Client({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        table_name AS name,
        obj_description((quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass, 'pg_class') AS comment,
        table_schema AS schema,
        pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) AS size,
        NULL AS rows
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    await client.end();
    
    return result.rows;
  }

  /**
   * 获取PostgreSQL表结构
   * @param connection 连接配置
   * @param tableName 表名
   * @returns 表结构信息
   */
  async getTableStructure(connection: any, tableName: string): Promise<TableColumnDto[]> {
    const { host, port, username, password, database, ssl } = connection;
    
    const client = new pg.Client({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    await client.connect();
    
    // 获取列信息
    const columnsResult = await client.query(`
      SELECT 
        a.attname AS name,
        format_type(a.atttypid, a.atttypmod) AS type,
        NOT a.attnotnull AS nullable,
        pg_get_expr(d.adbin, d.adrelid) AS default,
        col_description(a.attrelid, a.attnum) AS comment,
        EXISTS (
          SELECT 1
          FROM pg_constraint c
          WHERE c.conrelid = a.attrelid
            AND a.attnum = ANY(c.conkey)
            AND c.contype = 'p'
        ) AS "isPrimary",
        EXISTS (
          SELECT 1
          FROM pg_constraint c
          WHERE c.conrelid = a.attrelid
            AND a.attnum = ANY(c.conkey)
            AND c.contype = 'u'
        ) AS "isUnique",
        EXISTS (
          SELECT 1
          FROM pg_index i
          WHERE i.indrelid = a.attrelid
            AND a.attnum = ANY(i.indkey)
        ) AS "isIndex",
        EXISTS (
          SELECT 1
          FROM pg_constraint c
          WHERE c.conrelid = a.attrelid
            AND a.attnum = ANY(c.conkey)
            AND c.contype = 'f'
        ) AS "isForeign"
      FROM pg_attribute a
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = $1::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `, [tableName]);
    
    await client.end();
    
    return columnsResult.rows;
  }

  /**
   * 执行PostgreSQL查询
   * @param connection 连接配置
   * @param sql SQL语句
   * @returns 查询结果
   */
  async executeQuery(connection: any, sql: string): Promise<QueryResultDto> {
    const { host, port, username, password, database, ssl } = connection;
    
    const client = new pg.Client({
      host,
      port,
      user: username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    await client.connect();
    
    try {
      const result = await client.query(sql);
      
      const fields = result.fields?.map(field => ({
        name: field.name,
        type: field.dataTypeID.toString(),
      })) || [];
      
      return {
        fields,
        rows: result.rows,
        rowCount: result.rowCount,
      };
    } finally {
      await client.end();
    }
  }
}
