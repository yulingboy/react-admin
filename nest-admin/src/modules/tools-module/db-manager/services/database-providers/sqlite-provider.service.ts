import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { TestConnectionDto } from '../../dto/database-connection.dto';
import { QueryResultDto, TableColumnDto } from '../../dto/database-operation.dto';

/**
 * SQLite数据库提供者服务
 * 负责处理SQLite相关的数据库操作
 */
@Injectable()
export class SqliteProviderService {
  /**
   * 测试SQLite数据库连接
   * @param connectionData 连接数据
   */
  async testConnection(connectionData: TestConnectionDto): Promise<void> {
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

  /**
   * 获取SQLite数据库表列表
   * @param connection 连接配置
   * @returns 表列表
   */
  async getTables(connection: any): Promise<any[]> {
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

  /**
   * 获取SQLite表结构
   * @param connection 连接配置
   * @param tableName 表名
   * @returns 表结构信息
   */
  async getTableStructure(connection: any, tableName: string): Promise<TableColumnDto[]> {
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

  /**
   * 执行SQLite查询
   * @param connection 连接配置
   * @param sql SQL语句
   * @returns 查询结果
   */
  async executeQuery(connection: any, sql: string): Promise<QueryResultDto> {
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
