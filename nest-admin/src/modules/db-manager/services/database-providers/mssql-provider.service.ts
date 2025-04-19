import { Injectable } from '@nestjs/common';
import * as mssql from 'mssql';
import { TestConnectionDto } from '../../dto/database-connection.dto';
import { QueryResultDto, TableColumnDto } from '../../dto/database-operation.dto';

/**
 * Microsoft SQL Server数据库提供者服务
 * 负责处理MSSQL相关的数据库操作
 */
@Injectable()
export class MssqlProviderService {
  /**
   * 测试MSSQL数据库连接
   * @param connectionData 连接数据
   */
  async testConnection(connectionData: TestConnectionDto): Promise<void> {
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

  /**
   * 获取MSSQL数据库表列表
   * @param connection 连接配置
   * @returns 表列表
   */
  async getTables(connection: any): Promise<any[]> {
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

  /**
   * 获取MSSQL表结构
   * @param connection 连接配置
   * @param tableName 表名
   * @returns 表结构信息
   */
  async getTableStructure(connection: any, tableName: string): Promise<TableColumnDto[]> {
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

  /**
   * 执行MSSQL查询
   * @param connection 连接配置
   * @param sql SQL语句
   * @returns 查询结果
   */
  async executeQuery(connection: any, sql: string): Promise<QueryResultDto> {
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
}
