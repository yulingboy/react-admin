import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseConnectionService } from './database-connection.service';
import { DatabaseType, ExecuteSqlDto, TestConnectionDto } from '../dto/database-connection.dto';
import * as mysql from 'mysql2/promise';
import * as pg from 'pg';
import * as mssql from 'mssql';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

@Injectable()
export class DatabaseOperationService {
  constructor(private connectionService: DatabaseConnectionService) {}

  /**
   * 测试数据库连接
   * @param connectionData 连接数据
   */
  async testConnection(connectionData: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    try {
      const { type } = connectionData;

      switch (type) {
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
          await this.testMysqlConnection(connectionData);
          break;
          
        case DatabaseType.POSTGRES:
          await this.testPostgresConnection(connectionData);
          break;
          
        case DatabaseType.MSSQL:
          await this.testMssqlConnection(connectionData);
          break;
          
        case DatabaseType.SQLITE:
          await this.testSqliteConnection(connectionData);
          break;
          
        default:
          throw new BadRequestException('不支持的数据库类型');
      }
      
      return { success: true, message: '连接成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `连接失败: ${error.message || '未知错误'}` 
      };
    }
  }

  /**
   * 获取数据库表列表
   * @param connectionId 连接ID
   */
  async getTables(connectionId: number) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.getMysqlTables(connection);
        
      case DatabaseType.POSTGRES:
        return await this.getPostgresTables(connection);
        
      case DatabaseType.MSSQL:
        return await this.getMssqlTables(connection);
        
      case DatabaseType.SQLITE:
        return await this.getSqliteTables(connection);
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
  }

  /**
   * 获取表结构
   * @param connectionId 连接ID
   * @param tableName 表名
   */
  async getTableStructure(connectionId: number, tableName: string) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.getMysqlTableStructure(connection, tableName);
        
      case DatabaseType.POSTGRES:
        return await this.getPostgresTableStructure(connection, tableName);
        
      case DatabaseType.MSSQL:
        return await this.getMssqlTableStructure(connection, tableName);
        
      case DatabaseType.SQLITE:
        return await this.getSqliteTableStructure(connection, tableName);
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
  }

  /**
   * 获取表数据
   * @param connectionId 连接ID
   * @param tableName 表名
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getTableData(connectionId: number, tableName: string, page: number = 1, pageSize: number = 100) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    // 构建查询语句，限制结果数量
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    
    // 根据不同数据库类型构建不同的分页查询语句
    let sql: string;
    
    switch (connection.type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
      case DatabaseType.POSTGRES:
      case DatabaseType.SQLITE:
        sql = `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;
        break;
        
      case DatabaseType.MSSQL:
        sql = `SELECT TOP ${limit} * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowNum, *
          FROM ${tableName}
        ) AS RowConstrainedResult
        WHERE RowNum > ${offset}
        ORDER BY RowNum`;
        break;
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
    
    // 执行查询
    const startTime = Date.now();
    const result = await this.executeQuery(connection, sql);
    const executionTime = Date.now() - startTime;
    
    return {
      ...result,
      executionTime,
    };
  }

  /**
   * 执行SQL查询
   * @param connectionId 连接ID
   * @param dto SQL查询DTO
   */
  async executeSql(connectionId: number, dto: ExecuteSqlDto) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    // 执行查询
    const startTime = Date.now();
    const result = await this.executeQuery(connection, dto.sql);
    const executionTime = Date.now() - startTime;
    
    return {
      ...result,
      executionTime,
    };
  }

  /**
   * 执行查询
   * @param connection 连接配置
   * @param sql SQL语句
   */
  private async executeQuery(connection: any, sql: string) {
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.executeMysqlQuery(connection, sql);
        
      case DatabaseType.POSTGRES:
        return await this.executePostgresQuery(connection, sql);
        
      case DatabaseType.MSSQL:
        return await this.executeMssqlQuery(connection, sql);
        
      case DatabaseType.SQLITE:
        return await this.executeSqliteQuery(connection, sql);
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
  }

  // MySQL/MariaDB相关方法
  private async testMysqlConnection(connectionData: TestConnectionDto) {
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

  private async getMysqlTables(connection: any) {
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
    
    return rows;
  }

  private async getMysqlTableStructure(connection: any, tableName: string) {
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

  private async executeMysqlQuery(connection: any, sql: string) {
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

  // PostgreSQL相关方法
  private async testPostgresConnection(connectionData: TestConnectionDto) {
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

  private async getPostgresTables(connection: any) {
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

  private async getPostgresTableStructure(connection: any, tableName: string) {
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

  private async executePostgresQuery(connection: any, sql: string) {
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

  // Microsoft SQL Server相关方法
  private async testMssqlConnection(connectionData: TestConnectionDto) {
    const { host, port, username, password, database, ssl } = connectionData;
    
    const config = {
      server: host,
      port,
      user: username,
      password,
      database,
      options: {
        encrypt: ssl,
        trustServerCertificate: ssl,
      },
    };
    
    const pool = await mssql.connect(config);
    await pool.close();
  }

  private async getMssqlTables(connection: any) {
    const { host, port, username, password, database, ssl } = connection;
    
    const config = {
      server: host,
      port,
      user: username,
      password,
      database,
      options: {
        encrypt: ssl,
        trustServerCertificate: ssl,
      },
    };
    
    const pool = await mssql.connect(config);
    
    const result = await pool.request().query(`
      SELECT 
        t.name AS name,
        CAST(p.value AS NVARCHAR(MAX)) AS comment,
        NULL AS schema,
        SUM(a.used_pages) * 8 * 1024 AS size,
        p2.rows
      FROM sys.tables t
      LEFT JOIN sys.extended_properties p ON p.major_id = t.object_id AND p.minor_id = 0 AND p.name = 'MS_Description'
      LEFT JOIN sys.partitions p2 ON p2.object_id = t.object_id AND p2.index_id IN (0, 1)
      LEFT JOIN sys.allocation_units a ON a.container_id = p2.partition_id
      GROUP BY t.name, p.value, p2.rows
      ORDER BY t.name
    `);
    
    await pool.close();
    
    return result.recordset;
  }

  private async getMssqlTableStructure(connection: any, tableName: string) {
    const { host, port, username, password, database, ssl } = connection;
    
    const config = {
      server: host,
      port,
      user: username,
      password,
      database,
      options: {
        encrypt: ssl,
        trustServerCertificate: ssl,
      },
    };
    
    const pool = await mssql.connect(config);
    
    const result = await pool.request()
      .input('tableName', mssql.NVarChar, tableName)
      .query(`
        SELECT 
          c.name AS name,
          t.name + 
            CASE 
              WHEN t.name IN ('varchar', 'nvarchar', 'char', 'nchar') THEN '(' + 
                CASE 
                  WHEN c.max_length = -1 THEN 'MAX'
                  WHEN t.name IN ('nvarchar', 'nchar') THEN CAST(c.max_length/2 AS VARCHAR)
                  ELSE CAST(c.max_length AS VARCHAR)
                END + ')'
              WHEN t.name IN ('decimal', 'numeric') THEN '(' + CAST(c.precision AS VARCHAR) + ',' + CAST(c.scale AS VARCHAR) + ')'
              ELSE ''
            END AS type,
          c.is_nullable AS nullable,
          dc.definition AS [default],
          ep.value AS comment,
          CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS isPrimary,
          CASE WHEN uk.column_id IS NOT NULL THEN 1 ELSE 0 END AS isUnique,
          CASE WHEN idx.column_id IS NOT NULL THEN 1 ELSE 0 END AS isIndex,
          CASE WHEN fk.parent_column_id IS NOT NULL THEN 1 ELSE 0 END AS isForeign
        FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        JOIN sys.tables tb ON c.object_id = tb.object_id
        LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
        LEFT JOIN sys.extended_properties ep ON c.object_id = ep.major_id AND c.column_id = ep.minor_id AND ep.name = 'MS_Description'
        LEFT JOIN (
          SELECT ic.column_id, ic.object_id
          FROM sys.index_columns ic
          JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
          WHERE i.is_primary_key = 1
        ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
        LEFT JOIN (
          SELECT ic.column_id, ic.object_id
          FROM sys.index_columns ic
          JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
          WHERE i.is_unique = 1 AND i.is_primary_key = 0
        ) uk ON c.object_id = uk.object_id AND c.column_id = uk.column_id
        LEFT JOIN (
          SELECT ic.column_id, ic.object_id
          FROM sys.index_columns ic
          JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
          WHERE i.is_unique = 0
        ) idx ON c.object_id = idx.object_id AND c.column_id = idx.column_id
        LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
        WHERE tb.name = @tableName
        ORDER BY c.column_id
      `);
    
    await pool.close();
    
    return result.recordset;
  }

  private async executeMssqlQuery(connection: any, sql: string) {
    const { host, port, username, password, database, ssl } = connection;
    
    const config = {
      server: host,
      port,
      user: username,
      password,
      database,
      options: {
        encrypt: ssl,
        trustServerCertificate: ssl,
      },
    };
    
    const pool = await mssql.connect(config);
    
    try {
      const result = await pool.request().query(sql);
      
      const fieldsSet = new Set();
      const fields = [];
      
      if (result.recordset && result.recordset.length > 0) {
        for (const col in result.recordset[0]) {
          if (!fieldsSet.has(col)) {
            fieldsSet.add(col);
            fields.push({
              name: col,
              type: typeof result.recordset[0][col],
            });
          }
        }
      }
      
      return {
        fields,
        rows: result.recordset || [],
        rowCount: result.rowCount || 0,
      };
    } finally {
      await pool.close();
    }
  }

  // SQLite相关方法
  private async testSqliteConnection(connectionData: TestConnectionDto) {
    const { filename } = connectionData;
    
    if (!filename) {
      throw new Error('SQLite文件路径不能为空');
    }
    
    const db = await open({
      filename,
      driver: sqlite3.Database,
    });
    
    await db.get('SELECT 1');
    await db.close();
  }

  private async getSqliteTables(connection: any) {
    const { filename } = connection;
    
    const db = await open({
      filename,
      driver: sqlite3.Database,
    });
    
    // 获取表列表
    const tables = await db.all(`
      SELECT 
        name,
        NULL as comment,
        NULL as schema,
        NULL as size,
        NULL as rows
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    await db.close();
    
    return tables;
  }

  private async getSqliteTableStructure(connection: any, tableName: string) {
    const { filename } = connection;
    
    const db = await open({
      filename,
      driver: sqlite3.Database,
    });
    
    // 获取表信息
    const tableInfo = await db.all(`PRAGMA table_info('${tableName}')`);
    
    // 获取索引信息
    const indexList = await db.all(`PRAGMA index_list('${tableName}')`);
    
    // 获取外键信息
    const foreignKeys = await db.all(`PRAGMA foreign_key_list('${tableName}')`);
    
    // 处理表结构信息
    const columns = await Promise.all(tableInfo.map(async (column) => {
      // 判断是否为主键
      const isPrimary = column.pk === 1;
      
      // 判断是否为唯一索引
      const uniqueIndex = indexList.find(index => {
        return index.unique === 1;
      });
      
      let isUnique = false;
      if (uniqueIndex) {
        const indexInfo = await db.all(`PRAGMA index_info('${uniqueIndex.name}')`);
        isUnique = indexInfo.some(idx => idx.name === column.name);
      }
      
      // 判断是否为外键
      const isForeign = foreignKeys.some(fk => fk.from === column.name);
      
      // 判断是否为索引
      let isIndex = false;
      for (const index of indexList) {
        const indexInfo = await db.all(`PRAGMA index_info('${index.name}')`);
        if (indexInfo.some(idx => idx.name === column.name)) {
          isIndex = true;
          break;
        }
      }
      
      return {
        name: column.name,
        type: column.type,
        nullable: column.notnull === 0,
        default: column.dflt_value,
        comment: null, // SQLite没有列注释
        isPrimary,
        isUnique,
        isIndex,
        isForeign,
      };
    }));
    
    await db.close();
    
    return columns;
  }

  private async executeSqliteQuery(connection: any, sql: string) {
    const { filename } = connection;
    
    const db = await open({
      filename,
      driver: sqlite3.Database,
    });
    
    try {
      // 执行查询
      const rows = await db.all(sql);
      
      // 获取列信息
      const fields = rows.length > 0
        ? Object.keys(rows[0]).map(name => ({ name, type: typeof rows[0][name] }))
        : [];
      
      return {
        fields,
        rows,
        rowCount: rows.length,
      };
    } finally {
      await db.close();
    }
  }
}