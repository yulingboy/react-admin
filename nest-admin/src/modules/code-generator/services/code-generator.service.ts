import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CodeGeneratorDbService } from './code-generator-db.service';
import {
  CreateCodeGeneratorDto,
  CreateCodeGeneratorColumnDto,
  UpdateCodeGeneratorDto,
  UpdateCodeGeneratorColumnDto,
  ImportTableColumnsDto,
  SyncColumnsDto,
  QueryCodeGeneratorDto,
} from '../dto/index';
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
    private templateService: TemplateGeneratorService,
  ) {}

  /**
   * 创建代码生成器配置
   * 
   * @param dto 创建代码生成器的数据传输对象
   * @returns 创建的代码生成器配置
   * @throws BadRequestException 当名称已存在时抛出错误
   */
  async createGenerator(dto: CreateCodeGeneratorDto): Promise<CodeGenerator> {
    // 检查名称是否已存在
    const existingGenerator = await this.prisma.codeGenerator.findFirst({
      where: {
        name: dto.name
      }
    });

    if (existingGenerator) {
      throw new BadRequestException(`名称 "${dto.name}" 已存在，请使用不同的名称`);
    }

    return this.prisma.codeGenerator.create({
      data: dto,
    });
  }

  /**
   * 更新代码生成器配置
   * 
   * @param id 代码生成器ID
   * @param dto 更新代码生成器的数据传输对象
   * @returns 更新后的代码生成器配置
   * @throws NotFoundException 当指定ID的生成器不存在时抛出
   * @throws BadRequestException 当更新后的名称与其他记录冲突时抛出
   */
  async updateGenerator(id: number, dto: UpdateCodeGeneratorDto): Promise<CodeGenerator> {
    // 检查记录是否存在
    const existingGenerator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!existingGenerator) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的代码生成器配置`);
    }

    // 如果要更新名称，检查名称是否与其他记录冲突
    if (dto.name && dto.name !== existingGenerator.name) {
      const nameExists = await this.prisma.codeGenerator.findFirst({
        where: {
          name: dto.name,
          id: {
            not: Number(id), // 排除当前记录
          },
        },
      });

      if (nameExists) {
        throw new BadRequestException(`名称 "${dto.name}" 已被其他记录使用，请使用不同的名称`);
      }
    }

    return this.prisma.codeGenerator.update({
      where: { id: Number(id) },
      data: dto,
    });
  }

  /**
   * 删除代码生成器配置
   * 
   * @param id 要删除的代码生成器ID
   * @throws NotFoundException 当指定ID的生成器不存在时抛出
   */
  async deleteGenerator(id: number): Promise<void> {
    // 检查记录是否存在
    const existingGenerator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!existingGenerator) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的代码生成器配置，无法删除`);
    }

    // 删除关联的代码生成器列
    await this.prisma.codeGeneratorColumn.deleteMany({
      where: { generatorId: Number(id) },
    });

    // 删除代码生成器配置
    await this.prisma.codeGenerator.delete({
      where: { id: Number(id) },
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
          equals: Number(id),
        },
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
   * @param queryDto 查询参数
   * @returns 分页代码生成器列表
   */
  async getGeneratorList(queryDto: QueryCodeGeneratorDto): Promise<{ total: number; list: CodeGenerator[] }> {
    const { name, tableName } = queryDto;
    const { skip, take } = queryDto;

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
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, list };
  }

  /**
   * 创建代码生成器列
   * 
   * @param dto 创建代码生成器列的数据传输对象
   * @returns 创建的代码生成器列配置
   * @throws NotFoundException 当指定生成器ID不存在时抛出
   * @throws BadRequestException 当列名在同一生成器中已存在时抛出
   */
  async createColumn(dto: CreateCodeGeneratorColumnDto): Promise<CodeGeneratorColumn> {
    // 检查生成器是否存在
    const generator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: Number(dto.generatorId),
      },
    });

    if (!generator) {
      throw new NotFoundException(`未找到 ID 为 ${dto.generatorId} 的代码生成器配置`);
    }

    // 检查列名是否在同一个生成器中重复
    const existingColumn = await this.prisma.codeGeneratorColumn.findFirst({
      where: {
        generatorId: Number(dto.generatorId),
        columnName: dto.columnName,
      },
    });

    if (existingColumn) {
      throw new BadRequestException(`列名 "${dto.columnName}" 在当前生成器中已存在，请使用不同的列名`);
    }

    return this.prisma.codeGeneratorColumn.create({
      data: dto,
    });
  }

  /**
   * 更新代码生成器列
   * 
   * @param id 代码生成器列ID
   * @param dto 更新代码生成器列的数据传输对象
   * @returns 更新后的代码生成器列配置
   * @throws NotFoundException 当指定ID的列不存在时抛出
   * @throws BadRequestException 当更新后的列名与同一生成器中的其他列冲突时抛出
   */
  async updateColumn(id: number, dto: UpdateCodeGeneratorColumnDto): Promise<CodeGeneratorColumn> {
    // 检查记录是否存在
    const existingColumn = await this.prisma.codeGeneratorColumn.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!existingColumn) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的代码生成器列配置`);
    }

    // 如果要更新列名，检查新列名是否与同一生成器中的其他列重复
    if (dto.columnName && dto.columnName !== existingColumn.columnName) {
      const nameExists = await this.prisma.codeGeneratorColumn.findFirst({
        where: {
          generatorId: existingColumn.generatorId,
          columnName: dto.columnName,
          id: {
            not: Number(id), // 排除当前记录
          },
        },
      });

      if (nameExists) {
        throw new BadRequestException(`列名 "${dto.columnName}" 在当前生成器中已被其他列使用，请使用不同的列名`);
      }
    }

    return this.prisma.codeGeneratorColumn.update({
      where: { id: Number(id) },
      data: dto,
    });
  }

  /**
   * 删除代码生成器列
   * 
   * @param id 要删除的代码生成器列ID
   * @throws NotFoundException 当指定ID的列不存在时抛出
   */
  async deleteColumn(id: number): Promise<void> {
    // 检查记录是否存在
    const existingColumn = await this.prisma.codeGeneratorColumn.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!existingColumn) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的代码生成器列配置，无法删除`);
    }

    await this.prisma.codeGeneratorColumn.delete({
      where: { id: Number(id) },
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
   * 
   * 此方法用于从数据库表中导入列信息并转换为代码生成器配置
   * 
   * @param dto 导入表列信息的数据传输对象，包含生成器ID和表名
   * @returns 返回创建的代码生成器列配置数组
   * @throws NotFoundException 当找不到指定ID的生成器配置时抛出
   * @throws BadRequestException 当表名不存在或获取表列信息失败时抛出
   */
  async importTableColumns(dto: ImportTableColumnsDto): Promise<CodeGeneratorColumn[]> {
    const { generatorId, tableName } = dto;

    // 参数校验：确保generatorId为有效的数字
    if (!generatorId || isNaN(Number(generatorId))) {
      throw new BadRequestException('生成器ID无效，必须提供有效的数字ID');
    }

    // 参数校验：确保tableName为非空字符串
    if (!tableName || tableName.trim() === '') {
      throw new BadRequestException('表名不能为空');
    }

    // 检查生成器是否存在
    const generator = await this.prisma.codeGenerator.findFirst({
      where: {
        id: {
          equals: Number(generatorId),
        },
      },
    });

    if (!generator) {
      throw new NotFoundException(`未找到 ID 为 ${generatorId} 的代码生成器配置`);
    }

    try {
      // 获取表的列信息
      const tableColumns = await this.dbService.getTableColumns(tableName);
      
      // 校验：确保获取到了表的列信息
      if (!tableColumns || tableColumns.length === 0) {
        throw new BadRequestException(`表 ${tableName} 不存在或没有列信息`);
      }

      // 将列信息转换为代码生成器列
      const columns = await Promise.all(
        tableColumns.map(async (column, index) => {
          const { columnName, columnComment, columnType, columnKey, isNullable, extra } = column;

          // 根据数据库列属性计算代码生成器列属性
          const isPk = columnKey === 'PRI'; // 是否为主键
          const isIncrement = extra ? extra.includes('auto_increment') : false; // 是否自增
          const isRequired = isNullable === 'NO'; // 是否必填
          const tsType = dbTypeToTsType(columnType); // 数据库类型转换为TypeScript类型
          const htmlType = dbTypeToHtmlType(columnType, columnName); // 数据库类型转换为HTML表单类型

          // 创建代码生成器列配置记录
          return this.prisma.codeGeneratorColumn.create({
            data: {
              generatorId: Number(generatorId),
              columnName,
              columnComment: columnComment || '', // 确保注释不为null
              columnType,
              tsType,
              isPk,
              isIncrement,
              isRequired,
              isInsert: !isIncrement, // 自增字段默认不需要插入
              isEdit: !isPk, // 主键默认不需要编辑
              isList: true, // 默认在列表中显示
              // 智能决定哪些字段适合作为查询条件
              isQuery: isPk || ['status', 'type', 'name', 'title', 'key', 'code', 'id'].some((key) => 
                columnName.toLowerCase().includes(key.toLowerCase())),
              // 根据字段名特征决定查询类型
              queryType: columnName.toLowerCase().includes('name') || 
                        columnName.toLowerCase().includes('title') || 
                        columnName.toLowerCase().includes('description') ? 'LIKE' : 'EQ',
              htmlType,
              sort: index, // 设置排序值
            },
          });
        }),
      );

      return columns;
    } catch (error) {
      // 捕获并转换可能的数据库错误
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`导入表 ${tableName} 的列信息失败: ${error.message}`);
    }
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
