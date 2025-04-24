import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTestHistoryQueryDto } from '../dto';
import { ApiTesterBaseService } from './api-tester-base.service';

/**
 * API测试历史记录服务
 * 处理API测试的历史记录管理
 */
@Injectable()
export class ApiTesterHistoryService extends ApiTesterBaseService {
  /**
   * 获取API测试历史记录
   * @param query 查询参数
   * @param userId 当前用户ID
   * @returns 历史记录列表和总数
   */
  async getHistory(query: ApiTestHistoryQueryDto, userId: number) {
    const { current = 1, pageSize = 10, name, method, url, startTime, endTime } = query;
    const skip = (current - 1) * pageSize;

    // 构建过滤条件
    const where: any = { userId };

    if (name) {
      where.name = { contains: name };
    }

    if (method) {
      where.method = method;
    }

    if (url) {
      where.url = { contains: url };
    }

    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) {
        where.createdAt.gte = new Date(startTime);
      }
      if (endTime) {
        where.createdAt.lte = new Date(endTime);
      }
    }

    // 查询总数
    const total = await this.prisma.apiTestHistory.count({ where });

    // 查询列表
    const list = await this.prisma.apiTestHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return { total, list };
  }

  /**
   * 获取API测试历史记录详情
   * @param id 历史记录ID
   * @param userId 当前用户ID
   * @returns 历史记录详情
   */
  async getHistoryDetail(id: number, userId: number) {
    const history = await this.prisma.apiTestHistory.findUnique({
      where: { id },
    });

    if (!history || (history.userId !== userId && userId !== 1)) {
      throw new HttpException('历史记录不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return history;
  }

  /**
   * 删除API测试历史记录
   * @param id 历史记录ID
   * @param userId 当前用户ID
   * @returns 删除结果
   */
  async deleteHistory(id: number, userId: number) {
    const history = await this.prisma.apiTestHistory.findUnique({
      where: { id },
    });

    if (!history || (history.userId !== userId && userId !== 1)) {
      throw new HttpException('历史记录不存在或无权删除', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestHistory.delete({
      where: { id },
    });
  }

  /**
   * 批量删除API测试历史记录
   * @param ids 历史记录ID数组
   * @param userId 当前用户ID
   * @returns 批量删除结果
   */
  async batchDeleteHistory(ids: number[], userId: number) {
    // 超级管理员可以删除所有记录，普通用户只能删除自己的记录
    if (userId === 1) {
      return this.prisma.apiTestHistory.deleteMany({
        where: { id: { in: ids } },
      });
    } else {
      return this.prisma.apiTestHistory.deleteMany({
        where: {
          id: { in: ids },
          userId,
        },
      });
    }
  }
}