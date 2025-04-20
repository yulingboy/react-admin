import { Module } from '@nestjs/common';
import { ApiTesterModule } from './api-tester/api-tester.module';
import { CodeGeneratorModule } from './code-generator/code-generator.module';
import { DbManagerModule } from './db-manager/db-manager.module';
import { SqlExecutorModule } from './sql-executor/sql-executor.module';

@Module({
  imports: [ApiTesterModule, CodeGeneratorModule, DbManagerModule, SqlExecutorModule],
  exports: [ApiTesterModule, CodeGeneratorModule, DbManagerModule, SqlExecutorModule],
})
export class ToolsModuleGroup {}