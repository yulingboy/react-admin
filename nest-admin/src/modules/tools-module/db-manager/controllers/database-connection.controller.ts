import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { DatabaseConnectionService } from '../services/database-connection.service';
import { DatabaseOperationService } from '../services/database-operation.service';
import { CreateDatabaseConnectionDto, UpdateDatabaseConnectionDto, QueryDatabaseConnectionDto, TestConnectionDto } from '../dto/database-connection.dto';
import { ExecuteSqlDto } from '../dto/database-operation.dto';

/**
 * 数据库连接管理控制器
 * 负责处理数据库连接的CRUD操作和数据库操作相关的API
 */
@Controller('db-manager/connections')
export class DatabaseConnectionController {
  constructor(
    private readonly connectionService: DatabaseConnectionService,
    private readonly operationService: DatabaseOperationService,
  ) {}

  //===========================
  // 数据库连接管理相关接口
  //===========================
  
  /**
   * 创建新的数据库连接
   * @param createDto 创建数据库连接的数据传输对象
   * @returns 创建成功的数据库连接信息
   */
  @Post()
  async create(@Body() createDto: CreateDatabaseConnectionDto) {
    return this.connectionService.create(createDto);
  }

  /**
   * 获取所有数据库连接列表，支持分页和过滤
   * @param query 查询参数，包含分页和过滤条件
   * @returns 数据库连接列表及分页信息
   */
  @Get()
  async findAll(@Query() query: QueryDatabaseConnectionDto) {
    return this.connectionService.findAll(query);
  }

  /**
   * 根据ID获取单个数据库连接详情
   * @param id 数据库连接ID
   * @returns 数据库连接详细信息
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.connectionService.findOne(id);
  }

  /**
   * 更新数据库连接信息
   * @param id 要更新的数据库连接ID
   * @param updateDto 更新的数据传输对象
   * @returns 更新后的数据库连接信息
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDatabaseConnectionDto,
  ) {
    return this.connectionService.update(id, updateDto);
  }

  /**
   * 删除数据库连接
   * @param id 要删除的数据库连接ID
   * @returns 删除操作结果
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.connectionService.remove(id);
  }

  /**
   * 测试数据库连接是否可用
   * @param testDto 测试连接所需的参数
   * @returns 连接测试结果
   */
  @Post('test')
  async testConnection(@Body() testDto: TestConnectionDto) {
    return this.operationService.testConnection(testDto);
  }

  //===========================
  // 数据库操作相关接口
  //===========================
  
  /**
   * 获取指定数据库连接中的所有表
   * @param id 数据库连接ID
   * @returns 表列表信息
   */
  @Get(':id/tables')
  async getTables(@Param('id', ParseIntPipe) id: number) {
    return this.operationService.getTables(id);
  }

  /**
   * 获取指定表的结构信息
   * @param id 数据库连接ID
   * @param tableName 表名
   * @returns 表结构信息，包含字段、索引等
   */
  @Get(':id/tables/:tableName/structure')
  async getTableStructure(
    @Param('id', ParseIntPipe) id: number,
    @Param('tableName') tableName: string,
  ) {
    return this.operationService.getTableStructure(id, tableName);
  }

  /**
   * 获取指定表的数据内容，支持分页
   * @param id 数据库连接ID
   * @param tableName 表名
   * @param page 页码，默认为第1页
   * @param pageSize 每页记录数，默认值由服务决定
   * @returns 分页的表数据内容
   */
  @Get(':id/tables/:tableName/data')
  async getTableData(
    @Param('id', ParseIntPipe) id: number,
    @Param('tableName') tableName: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.operationService.getTableData(id, tableName, page, pageSize);
  }

  /**
   * 在指定数据库连接上执行SQL语句
   * @param id 数据库连接ID
   * @param dto 包含要执行的SQL语句的数据传输对象
   * @returns SQL执行结果
   */
  @Post(':id/execute')
  async executeSql(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExecuteSqlDto,
  ) {
    return this.operationService.executeSql(id, dto);
  }
}