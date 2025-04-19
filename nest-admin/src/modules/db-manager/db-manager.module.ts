import { Module } from '@nestjs/common';
import { DatabaseConnectionController } from './controllers/database-connection.controller';
import { DatabaseConnectionService } from './services/database-connection.service';
import { DatabaseOperationService } from './services/database-operation.service';
import { MysqlProviderService } from './services/database-providers/mysql-provider.service';
import { PostgresProviderService } from './services/database-providers/postgres-provider.service';
import { MssqlProviderService } from './services/database-providers/mssql-provider.service';
import { SqliteProviderService } from './services/database-providers/sqlite-provider.service';

/**
 * 数据库管理模块
 * 提供数据库连接管理和操作的功能
 */
@Module({
  controllers: [DatabaseConnectionController],
  providers: [
    DatabaseConnectionService, 
    DatabaseOperationService,
    MysqlProviderService,
    PostgresProviderService,
    MssqlProviderService,
    SqliteProviderService
  ],
  exports: [DatabaseConnectionService, DatabaseOperationService],
})
export class DbManagerModule {}