import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ExecuteSqlDto } from './dto';

@Injectable()
export class SqlExecutorService {
  constructor(private prisma: PrismaService) {}

  /**
   * 执行SQL语句
   * 
   * @param dto 执行SQL的数据传输对象
   * @returns 执行结果
   * @throws BadRequestException 当SQL执行出错时抛出
   */
  async executeSql(dto: ExecuteSqlDto): Promise<any> {
    try {
      const { sql } = dto;
      
      // 检查SQL语句是否为查询语句
      const isQuery = /^select\s+/i.test(sql.trim());
      
      if (isQuery) {
        // 执行查询SQL
        const result = await this.prisma.$queryRawUnsafe(sql);
        return result;
      } else {
        // 执行更新/插入/删除等操作SQL
        const result = await this.prisma.$executeRawUnsafe(sql);
        return { affectedRows: result };
      }
    } catch (error) {
      throw new BadRequestException(`SQL执行失败: ${error.message}`);
    }
  }
}