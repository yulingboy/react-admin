import { Injectable, Logger } from '@nestjs/common';
import { CreateLoginLogDto, QueryLoginLogDto } from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 登录日志服务
 */
@Injectable()
export class LoginLogService {
  private readonly logger = new Logger(LoginLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建登录日志
   * @param createLoginLogDto 登录日志数据
   */
  async create(createLoginLogDto: CreateLoginLogDto) {
    try {

        const res =  await this.prisma.loginLog.create({
        data: createLoginLogDto,
      });
      this.logger.log(`创建登录日志成功: ${JSON.stringify(res)}`);
    } catch (error) {
      this.logger.error(`创建登录日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 分页查询登录日志
   * @param queryDto 查询条件
   */
  async findAll(queryDto: QueryLoginLogDto) {
    const { current = 1, pageSize = 10, username, ipAddress, status, startTime, endTime } = queryDto;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.LoginLogWhereInput = {};
    
    if (username) {
      where.username = { contains: username };
    }
    
    if (ipAddress) {
      where.ipAddress = { contains: ipAddress };
    }
    
    if (status) {
      where.status = status;
    }
    
    // 处理时间范围查询
    if (startTime || endTime) {
      where.loginTime = {};
      
      if (startTime) {
        where.loginTime.gte = new Date(startTime);
      }
      
      if (endTime) {
        where.loginTime.lte = new Date(endTime);
      }
    }

    try {
      // 查询总数
      const total = await this.prisma.loginLog.count({ where });
      
      // 查询数据
      const list = await this.prisma.loginLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { loginTime: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });

      return {
        list,
        pagination: {
          current: current,
          pageSize,
          total
        }
      };
    } catch (error) {
      this.logger.error(`查询登录日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清空登录日志
   */
  async clear() {
    try {
      return await this.prisma.loginLog.deleteMany({});
    } catch (error) {
      this.logger.error(`清空登录日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量删除登录日志
   * @param ids 日志ID数组
   */
  async batchDelete(ids: number[]) {
    try {
      return await this.prisma.loginLog.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
    } catch (error) {
      this.logger.error(`批量删除登录日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询单条登录日志
   * @param id 日志ID
   */
  async findOne(id: number) {
    try {
      return await this.prisma.loginLog.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      this.logger.error(`查询单条登录日志失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}