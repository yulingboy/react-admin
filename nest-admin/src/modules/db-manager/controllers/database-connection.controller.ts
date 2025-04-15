import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { DatabaseConnectionService } from '../services/database-connection.service';
import { DatabaseOperationService } from '../services/database-operation.service';
import { CreateDatabaseConnectionDto, UpdateDatabaseConnectionDto, QueryDatabaseConnectionDto, TestConnectionDto, ExecuteSqlDto } from '../dto/database-connection.dto';

@Controller('db-manager/connections')
export class DatabaseConnectionController {
  constructor(
    private readonly connectionService: DatabaseConnectionService,
    private readonly operationService: DatabaseOperationService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateDatabaseConnectionDto) {
    return this.connectionService.create(createDto);
  }

  @Get()
  async findAll(@Query() query: QueryDatabaseConnectionDto) {
    return this.connectionService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.connectionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDatabaseConnectionDto,
  ) {
    return this.connectionService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.connectionService.remove(id);
  }

  @Post('test')
  async testConnection(@Body() testDto: TestConnectionDto) {
    return this.operationService.testConnection(testDto);
  }

  @Get(':id/tables')
  async getTables(@Param('id', ParseIntPipe) id: number) {
    return this.operationService.getTables(id);
  }

  @Get(':id/tables/:tableName/structure')
  async getTableStructure(
    @Param('id', ParseIntPipe) id: number,
    @Param('tableName') tableName: string,
  ) {
    return this.operationService.getTableStructure(id, tableName);
  }

  @Get(':id/tables/:tableName/data')
  async getTableData(
    @Param('id', ParseIntPipe) id: number,
    @Param('tableName') tableName: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.operationService.getTableData(id, tableName, page, pageSize);
  }

  @Post(':id/execute')
  async executeSql(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExecuteSqlDto,
  ) {
    return this.operationService.executeSql(id, dto);
  }
}