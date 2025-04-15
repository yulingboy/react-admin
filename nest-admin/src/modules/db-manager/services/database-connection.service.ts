import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateDatabaseConnectionDto, UpdateDatabaseConnectionDto, QueryDatabaseConnectionDto, DatabaseType } from '../dto/database-connection.dto';

@Injectable()
export class DatabaseConnectionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建数据库连接
   * @param data 连接数据
   */
  async create(data: CreateDatabaseConnectionDto) {
    return await this.prisma.databaseConnection.create({
      data: {
        ...data,
        isSystem: '0', // 默认为非系统内置
      },
    });
  }

  /**
   * 获取数据库连接列表
   * @param query 查询参数
   */
  async findAll(query: QueryDatabaseConnectionDto) {
    const { current = 1, pageSize = 10, ...filters } = query;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    
    if (filters.name) {
      where.name = { contains: filters.name };
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    // 获取总记录数
    const total = await this.prisma.databaseConnection.count({ where });

    // 获取记录列表
    const list = await this.prisma.databaseConnection.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    // 返回列表和总记录数
    return { list, total };
  }

  /**
   * 获取数据库连接详情
   * @param id 连接ID
   */
  async findOne(id: number) {
    const connection = await this.prisma.databaseConnection.findUnique({
      where: { id },
    });
    
    if (!connection) {
      throw new NotFoundException(`数据库连接 ID:${id} 不存在`);
    }
    
    return connection;
  }

  /**
   * 更新数据库连接
   * @param id 连接ID
   * @param data 连接数据
   */
  async update(id: number, data: UpdateDatabaseConnectionDto) {
    // 检查连接是否存在
    await this.findOne(id);

    return await this.prisma.databaseConnection.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除数据库连接
   * @param id 连接ID
   */
  async remove(id: number) {
    // 检查连接是否存在
    const connection = await this.findOne(id);
    
    // 系统内置连接不允许删除
    if (connection.isSystem === '1') {
      throw new Error('系统内置连接不允许删除');
    }
    
    return await this.prisma.databaseConnection.delete({
      where: { id },
    });
  }
}