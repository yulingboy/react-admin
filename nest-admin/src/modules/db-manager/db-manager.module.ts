import { Module } from '@nestjs/common';
import { DatabaseConnectionController } from './controllers/database-connection.controller';
import { DatabaseConnectionService } from './services/database-connection.service';
import { DatabaseOperationService } from './services/database-operation.service';

@Module({
  controllers: [DatabaseConnectionController],
  providers: [DatabaseConnectionService, DatabaseOperationService],
  exports: [DatabaseConnectionService, DatabaseOperationService],
})
export class DbManagerModule {}