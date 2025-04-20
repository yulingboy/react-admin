import { Body, Controller, Post } from '@nestjs/common';
import { SqlExecutorService } from './sql-executor.service';
import { ExecuteSqlDto } from './dto';

/**
 * SQL执行器控制器
 * 提供SQL执行相关的API接口
 */
@Controller('sql-executor')
export class SqlExecutorController {
  constructor(private readonly sqlExecutorService: SqlExecutorService) {}

  /**
   * 执行SQL语句
   * @param dto 执行SQL的DTO
   * @returns SQL执行结果
   */
  @Post('execute')
  async executeSql(@Body() dto: ExecuteSqlDto) {
    return await this.sqlExecutorService.executeSql(dto);
  }
}