import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TableInfo, ColumnInfo } from '../interfaces/code-generator.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class CodeGeneratorDbService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有表信息
   */
  async getAllTables(): Promise<TableInfo[]> {
    const result = await this.prisma.$queryRaw`
      SELECT
        table_name as tableName,
        table_comment as tableComment
      FROM
        information_schema.tables
      WHERE
        table_schema = DATABASE()
      ORDER BY
        table_name
    `;
    console.log('result', result);

    return result as TableInfo[];
  }

  /**
   * 获取表的所有列信息
   */
  async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const result = await this.prisma.$queryRaw`
      SELECT
        column_name as columnName,
        column_comment as columnComment,
        column_type as columnType,
        column_key as columnKey,
        is_nullable as isNullable,
        column_default as columnDefault,
        extra
      FROM
        information_schema.columns
      WHERE
        table_schema = DATABASE()
        AND table_name = ${tableName}
      ORDER BY
        ordinal_position
    `;

    return result as ColumnInfo[];
  }
}