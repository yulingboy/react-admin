import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * 定时任务日志服务
 * 负责定时任务日志的查询和管理
 */
@Injectable()
export class ScheduleJobLogService {
  private readonly logger = new Logger(ScheduleJobLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取任务日志分页列表
   */
  async getJobLogs(jobId: number, page = 1, pageSize = 10) {
    // 确保页码和每页条数为数字
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);
    
    // 构建查询条件
    const where: any = {};
    if (jobId) {
      where.jobId = jobId;
    }

    // 查询总数
    const total = await this.prisma.scheduleJobLog.count({ where });

    // 分页查询
    const data = await this.prisma.scheduleJobLog.findMany({
      where,
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      orderBy: { createdAt: 'desc' },
    });

    return {
      list: data,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
    };
  }

  /**
   * 清空任务日志
   * @param jobId 任务ID，不传则清空所有日志
   */
  async clearJobLogs(jobId?: number) {
    try {
      const where = jobId ? { jobId } : {};
      await this.prisma.scheduleJobLog.deleteMany({ where });
      return true;
    } catch (error) {
      this.logger.error('清空任务日志失败', error);
      throw new BadRequestException('清空任务日志失败: ' + error.message);
    }
  }

  /**
   * 创建任务执行日志
   * 此方法主要供内部使用，由任务执行器调用
   */
  async createJobLog(logData: any) {
    try {
      return await this.prisma.scheduleJobLog.create({
        data: logData,
      });
    } catch (error) {
      this.logger.error('创建任务日志失败', error);
      // 这里不抛出异常，避免影响任务执行
      return null;
    }
  }
}