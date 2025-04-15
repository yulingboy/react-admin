import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { CodeGeneratorService } from './services/code-generator.service';
import { 
  CodePreviewDto, 
  CreateCodeGeneratorColumnDto, 
  CreateCodeGeneratorDto, 
  GenerateCodeDto, 
  ImportTableColumnsDto, 
  QueryCodeGeneratorDto, 
  SyncColumnsDto, 
  UpdateCodeGeneratorColumnDto, 
  UpdateCodeGeneratorDto, 
} from './dto/index';

/**
 * 代码生成器控制器
 * 提供代码生成相关的API接口，包括代码生成器配置的CRUD操作和代码生成功能
 */
@Controller('code-generator')
export class CodeGeneratorController {
  constructor(private readonly codeGeneratorService: CodeGeneratorService) { }

  /**
   * 创建代码生成器配置
   * @param dto 创建代码生成器DTO
   * @returns 创建的代码生成器配置
   */
  @Post()
  async create(@Body() dto: CreateCodeGeneratorDto) {
    return await this.codeGeneratorService.createGenerator(dto);
  }

  /**
   * 获取所有数据库表信息
   * @returns 数据库中的所有表信息列表
   */
  @Get('tables')
  async getAllTables() {
    return await this.codeGeneratorService.getAllTables();
  }

  /**
   * 导入表结构的列信息
   * @param dto 导入表列信息DTO
   * @returns 导入的列信息列表
   */
  @Post('import-columns')
  async importTableColumns(@Body() dto: ImportTableColumnsDto) {
    return await this.codeGeneratorService.importTableColumns(dto);
  }

  /**
   * 同步表结构列信息
   * @param dto 同步列信息DTO
   * @returns 同步后的列信息列表
   */
  @Post('sync-columns')
  async syncTableColumns(@Body() dto: SyncColumnsDto) {
    return await this.codeGeneratorService.syncTableColumns(dto);
  }

  /**
   * 创建代码生成器列信息
   * @param dto 创建代码生成器列DTO
   * @returns 创建的列信息
   */
  @Post('column')
  async createColumn(@Body() dto: CreateCodeGeneratorColumnDto) {
    return await this.codeGeneratorService.createColumn(dto);
  }

  /**
   * 更新代码生成器列信息
   * @param dto 更新代码生成器列DTO
   * @returns 更新后的列信息
   */
  @Put('column')
  async updateColumn(@Body() dto: UpdateCodeGeneratorColumnDto) {
    // 从dto中获取id，而不是从URL路径
    return await this.codeGeneratorService.updateColumn(dto.id, dto);
  }

  /**
   * 删除代码生成器列信息
   * @param id 列ID
   */
  @Delete('column/:columnId')
  @HttpCode(204)
  async deleteColumn(@Param('columnId', ParseIntPipe) id: number) {
    await this.codeGeneratorService.deleteColumn(id);
  }

  /**
   * 预览生成的代码
   * @param dto 代码预览DTO
   * @returns 预览的代码文件列表
   */
  @Post('preview')
  async previewCode(@Body() dto: CodePreviewDto) {
    if (typeof dto.id === 'string') {
      dto.id = parseInt(dto.id, 10);
    }
    return await this.codeGeneratorService.previewCode(dto.id);
  }

  /**
   * 生成代码并下载
   * @param dto 生成代码DTO
   * @param res HTTP响应对象
   * @returns 生成的代码文件压缩包
   */
  @Post('generate')
  async generateCode(@Body() dto: GenerateCodeDto, @Res({ passthrough: true }) res: Response) {
    if (typeof dto.id === 'string') {
      dto.id = parseInt(dto.id, 10);
    }
    const buffer = await this.codeGeneratorService.generateCode(dto.id);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="generated-code.zip"',
    });
    return new StreamableFile(buffer);
  }

  /**
   * 获取代码生成器配置详情
   * @param id 代码生成器ID
   * @returns 代码生成器配置详情，包含列信息
   */
  @Get('detail/:generatorId')
  async findOne(@Param('generatorId', ParseIntPipe) id: number) {
    return await this.codeGeneratorService.getGenerator(id);
  }

  /**
   * 更新代码生成器配置
   * @param id 代码生成器ID
   * @param dto 更新代码生成器DTO
   * @returns 更新后的代码生成器配置
   */
  @Put('update/:generatorId')
  async update(@Param('generatorId', ParseIntPipe) id: number, @Body() dto: UpdateCodeGeneratorDto) {
    return await this.codeGeneratorService.updateGenerator(id, dto);
  }

  /**
   * 删除代码生成器配置
   * @param id 代码生成器ID
   */
  @Delete('delete/:generatorId')
  @HttpCode(204)
  async delete(@Param('generatorId', ParseIntPipe) id: number) {
    await this.codeGeneratorService.deleteGenerator(id);
  }

  /**
   * 分页查询代码生成器配置列表
   * @param queryDto 查询参数DTO
   * @returns 分页的代码生成器配置列表
   */
  @Get()
  async findAll(@Query() queryDto: QueryCodeGeneratorDto) {
    return await this.codeGeneratorService.getGeneratorList(queryDto);
  }
}
