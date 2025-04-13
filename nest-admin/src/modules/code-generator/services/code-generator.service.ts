import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CodeGeneratorDbService } from './code-generator-db.service';
import { 
  CreateCodeGeneratorDto, 
  CreateCodeGeneratorColumnDto, 
  UpdateCodeGeneratorDto,
  UpdateCodeGeneratorColumnDto,
  ImportTableColumnsDto,
  SyncColumnsDto
} from '../dto/code-generator.dto';
import { CodeGenerator, CodeGeneratorColumn, Prisma } from '@prisma/client';
import { dbTypeToHtmlType, dbTypeToTsType } from '../utils/code-generator.utils';
import { TemplateGeneratorService } from './template-generator.service';
import { CodeGenerateOptions, GenerateCode } from '../interfaces/code-generator.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as JSZip from 'jszip';

@Injectable()
export class CodeGeneratorService {
  constructor(
    private prisma: PrismaService,
    private dbService: CodeGeneratorDbService,
    private templateService: TemplateGeneratorService
  ) {}

  /**
   * 创建代码生成器配置
   */
  async createGenerator(dto: CreateCodeGeneratorDto): Promise<CodeGenerator> {
    return this.prisma.codeGenerator.create({
      data: dto,
    });
  }

  /**
   * 更新代码生成器配置
   */
  async updateGenerator(id: number, dto: UpdateCodeGeneratorDto): Promise<CodeGenerator> {
    return this.prisma.codeGenerator.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除代码生成器配置
   */
  async deleteGenerator(id: number): Promise<void> {
    await this.prisma.codeGenerator.delete({
      where: { id },
    });
  }

  /**
   * 获取代码生成器配置
   */
  async getGenerator(id: number): Promise<CodeGenerator & { columns: CodeGeneratorColumn[] }> {
    console.log('id', id);
    // 使用findFirstOrThrow代替findUnique，这样可以直接使用比较运算符
    const generator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: {
          equals: Number(id)
        }
      },
      include: {
        columns: {
          orderBy: {
            sort: 'asc',
          },
        },
      },
    });

    if (!generator) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的代码生成器配置`);
    }

    return generator;
  }

  /**
   * 获取代码生成器列表
   */
  async getGeneratorList(query: {
    page?: number;
    pageSize?: number;
    name?: string;
    tableName?: string;
  }): Promise<{ total: number; list: CodeGenerator[] }> {
    const { page = 1, pageSize = 10, name, tableName } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CodeGeneratorWhereInput = {};

    if (name) {
      where.name = { contains: name };
    }

    if (tableName) {
      where.tableName = { contains: tableName };
    }

    const [total, list] = await Promise.all([
      this.prisma.codeGenerator.count({ where }),
      this.prisma.codeGenerator.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, list };
  }

  /**
   * 创建代码生成器列
   */
  async createColumn(dto: CreateCodeGeneratorColumnDto): Promise<CodeGeneratorColumn> {
    return this.prisma.codeGeneratorColumn.create({
      data: dto,
    });
  }

  /**
   * 更新代码生成器列
   */
  async updateColumn(id: number, dto: UpdateCodeGeneratorColumnDto): Promise<CodeGeneratorColumn> {
    return this.prisma.codeGeneratorColumn.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除代码生成器列
   */
  async deleteColumn(id: number): Promise<void> {
    await this.prisma.codeGeneratorColumn.delete({
      where: { id },
    });
  }

  /**
   * 获取数据库中的所有表
   */
  async getAllTables() {
    return this.dbService.getAllTables();
  }

  /**
   * 导入表的列信息
   */
  async importTableColumns(dto: ImportTableColumnsDto): Promise<CodeGeneratorColumn[]> {
    const { generatorId, tableName } = dto;

    // 检查生成器是否存在
    const generator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: {
          equals: Number(generatorId)
        }
      },
    });

    if (!generator) {
      throw new NotFoundException(`未找到 ID 为 ${generatorId} 的代码生成器配置`);
    }

    // 获取表的列信息
    const tableColumns = await this.dbService.getTableColumns(tableName);

    // 将列信息转换为代码生成器列
    const columns = await Promise.all(
      tableColumns.map(async (column, index) => {
        const { columnName, columnComment, columnType, columnKey, isNullable, extra } = column;
        
        const isPk = columnKey === 'PRI';
        const isIncrement = extra ? extra.includes('auto_increment') : false;
        const isRequired = isNullable === 'NO';
        const tsType = dbTypeToTsType(columnType);
        const htmlType = dbTypeToHtmlType(columnType, columnName);

        return this.prisma.codeGeneratorColumn.create({
          data: {
            generatorId: Number(generatorId),
            columnName,
            columnComment: columnComment || '',
            columnType,
            tsType,
            isPk,
            isIncrement,
            isRequired,
            isInsert: !isIncrement, // 自增字段不需要插入
            isEdit: !isPk, // 主键不需要编辑
            isList: true,
            isQuery: isPk || ['status', 'type', 'name', 'title'].some(key => columnName.includes(key)),
            queryType: columnName.includes('name') || columnName.includes('title') ? 'LIKE' : 'EQ',
            htmlType,
            sort: index,
          },
        });
      })
    );

    return columns;
  }

  /**
   * 同步表的列信息
   */
  async syncTableColumns(dto: SyncColumnsDto): Promise<CodeGeneratorColumn[]> {
    const { id } = dto;
    console.log('2id', id);
    // 获取生成器配置
    const generator = await this.getGenerator(id);

    // 删除旧的列信息
    await this.prisma.codeGeneratorColumn.deleteMany({
      where: { generatorId: id },
    });

    // 导入新的列信息
    return this.importTableColumns({
      generatorId: id,
      tableName: generator.tableName,
    });
  }

  /**
   * 生成代码
   */
  async generateCode(id: number): Promise<Buffer> {
    console.log('1id', id);
    // 获取生成器配置和列信息
    const generator = await this.getGenerator(id);
    
    // 生成代码
    const codeFiles = await this.templateService.generateCode(generator);
    
    // 创建压缩文件
    const zip = new JSZip();
    
    // 添加文件到压缩包
    for (const file of codeFiles) {
      // 创建目录结构
      const dir = path.dirname(file.path);
      if (dir !== '.') {
        zip.folder(dir);
      }
      
      // 添加文件内容
      zip.file(file.path, file.content);
    }
    
    // 生成压缩文件的二进制数据
    return zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * 预览代码
   */
  async previewCode(id: number): Promise<GenerateCode[]> {
    // 获取生成器配置和列信息
    console.log('2id', id); 
    const generator = await this.getGenerator(id);
    
    // 生成代码
    return this.templateService.generateCode(generator);
  }
}