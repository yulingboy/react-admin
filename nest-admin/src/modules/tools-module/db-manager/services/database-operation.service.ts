import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseConnectionService } from './database-connection.service';
import { DatabaseType, TestConnectionDto } from '../dto/database-connection.dto';
import { ExecuteSqlDto, QueryResultDto } from '../dto/database-operation.dto';
import { MysqlProviderService } from './database-providers/mysql-provider.service';
import { PostgresProviderService } from './database-providers/postgres-provider.service';
import { MssqlProviderService } from './database-providers/mssql-provider.service';
import { SqliteProviderService } from './database-providers/sqlite-provider.service';

/**
 * 数据库操作服务
 * 集成和统一处理各种数据库操作，委托给具体的数据库提供者服务执行
 */
@Injectable()
export class DatabaseOperationService {
  constructor(
    private connectionService: DatabaseConnectionService,
    private mysqlProvider: MysqlProviderService,
    private postgresProvider: PostgresProviderService,
    private mssqlProvider: MssqlProviderService,
    private sqliteProvider: SqliteProviderService
  ) {}

  /**
   * 测试数据库连接
   * @param connectionData 连接数据
   * @returns 连接测试结果
   */
  async testConnection(connectionData: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    try {
      const { type } = connectionData;

      switch (type) {
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
          await this.mysqlProvider.testConnection(connectionData);
          break;
          
        case DatabaseType.POSTGRES:
          await this.postgresProvider.testConnection(connectionData);
          break;
          
        case DatabaseType.MSSQL:
          await this.mssqlProvider.testConnection(connectionData);
          break;
          
        case DatabaseType.SQLITE:
          await this.sqliteProvider.testConnection(connectionData);
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
   * @returns 表列表
   */
  async getTables(connectionId: number) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.mysqlProvider.getTables(connection);
        
      case DatabaseType.POSTGRES:
        return await this.postgresProvider.getTables(connection);
        
      case DatabaseType.MSSQL:
        return await this.mssqlProvider.getTables(connection);
        
      case DatabaseType.SQLITE:
        return await this.sqliteProvider.getTables(connection);
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
  }

  /**
   * 获取表结构
   * @param connectionId 连接ID
   * @param tableName 表名
   * @returns 表结构信息
   */
  async getTableStructure(connectionId: number, tableName: string) {
    // 获取连接配置
    const connection = await this.connectionService.findOne(connectionId);
    
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.mysqlProvider.getTableStructure(connection, tableName);
        
      case DatabaseType.POSTGRES:
        return await this.postgresProvider.getTableStructure(connection, tableName);
        
      case DatabaseType.MSSQL:
        return await this.mssqlProvider.getTableStructure(connection, tableName);
        
      case DatabaseType.SQLITE:
        return await this.sqliteProvider.getTableStructure(connection, tableName);
        
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
   * @returns 表数据
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
   * @returns 查询结果
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
   * @returns 查询结果
   */
  private async executeQuery(connection: any, sql: string): Promise<QueryResultDto> {
    const { type } = connection;
    
    switch (type) {
      case DatabaseType.MYSQL:
      case DatabaseType.MARIADB:
        return await this.mysqlProvider.executeQuery(connection, sql);
        
      case DatabaseType.POSTGRES:
        return await this.postgresProvider.executeQuery(connection, sql);
        
      case DatabaseType.MSSQL:
        return await this.mssqlProvider.executeQuery(connection, sql);
        
      case DatabaseType.SQLITE:
        return await this.sqliteProvider.executeQuery(connection, sql);
        
      default:
        throw new BadRequestException('不支持的数据库类型');
    }
  }
}