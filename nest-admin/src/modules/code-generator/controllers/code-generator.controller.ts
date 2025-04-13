import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { CodeGeneratorService } from '../services/code-generator.service';
import {
  CodePreviewDto,
  CreateCodeGeneratorColumnDto,
  CreateCodeGeneratorDto,
  GenerateCodeDto,
  ImportTableColumnsDto,
  SyncColumnsDto,
  UpdateCodeGeneratorColumnDto,
  UpdateCodeGeneratorDto,
} from '../dto/code-generator.dto';

@Controller('code-generator')
export class CodeGeneratorController {
  constructor(private readonly codeGeneratorService: CodeGeneratorService) {}

  @Post()
  async create(@Body() dto: CreateCodeGeneratorDto) {
    return await this.codeGeneratorService.createGenerator(dto);
  }

  @Get('tables')
  async getAllTables() {
    return await this.codeGeneratorService.getAllTables();
  }
  
  @Post('import-columns')
  async importTableColumns(@Body() dto: ImportTableColumnsDto) {
    return await this.codeGeneratorService.importTableColumns(dto);
  }

  @Post('sync-columns')
  async syncTableColumns(@Body() dto: SyncColumnsDto) {
    return await this.codeGeneratorService.syncTableColumns(dto);
  }

  @Post('column')
  async createColumn(@Body() dto: CreateCodeGeneratorColumnDto) {
    return await this.codeGeneratorService.createColumn(dto);
  }

  @Put('column')
  async updateColumn(@Body() dto: UpdateCodeGeneratorColumnDto) {
    // 从dto中获取id，而不是从URL路径
    return await this.codeGeneratorService.updateColumn(dto.id, dto);
  }

  @Delete('column/:columnId')
  @HttpCode(204)
  async deleteColumn(@Param('columnId', ParseIntPipe) id: number) {
    await this.codeGeneratorService.deleteColumn(id);
  }

  @Post('preview')
  async previewCode(@Body() dto: CodePreviewDto) {
    if (typeof dto.id === 'string') {
      dto.id = parseInt(dto.id, 10);
    }
    return await this.codeGeneratorService.previewCode(dto.id);
  }

  @Post('generate')
  async generateCode(
    @Body() dto: GenerateCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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

  @Get('detail/:generatorId')
  async findOne(@Param('generatorId', ParseIntPipe) id: number) {
    return await this.codeGeneratorService.getGenerator(id);
  }

  @Put('update/:generatorId')
  async update(@Param('generatorId', ParseIntPipe) id: number, @Body() dto: UpdateCodeGeneratorDto) {
    return await this.codeGeneratorService.updateGenerator(id, dto);
  }

  @Delete('delete/:generatorId')
  @HttpCode(204)
  async delete(@Param('generatorId', ParseIntPipe) id: number) {
    await this.codeGeneratorService.deleteGenerator(id);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('name') name: string,
    @Query('tableName') tableName: string,
  ) {
    return await this.codeGeneratorService.getGeneratorList({
      page: page ? +page : undefined,
      pageSize: pageSize ? +pageSize : undefined,
      name,
      tableName,
    });
  }
}