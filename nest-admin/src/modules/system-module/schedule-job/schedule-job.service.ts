import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateScheduleJobDto, UpdateScheduleJobDto, QueryScheduleJobDto } from './dto/schedule-job.dto';
import { ScheduleJobExecutorService } from './schedule-job-executor.service';
import { ScheduleJobLogService } from './schedule-job-log.service';

/**
 * 定时任务服务
 * 负责定时任务的CRUD操作和业务逻辑
 */
@Injectable()
export class ScheduleJobService {
  private readonly logger = new Logger(ScheduleJobService.name);

  constructor(
    private prisma: PrismaService,
    private executorService: ScheduleJobExecutorService,
    private logService: ScheduleJobLogService,
  ) {}

  /**
   * 初始化定时任务
   * 系统启动时调用
   */
  async initJobs() {
    return this.executorService.initJobs();
  }

  /**
   * 创建定时任务
   */
  async create(dto: CreateScheduleJobDto) {
    try {
      // 创建任务记录
      const job = await this.prisma.scheduleJob.create({
        data: {
          jobName: dto.jobName,
          jobGroup: dto.jobGroup || 'DEFAULT',
          invokeTarget: dto.invokeTarget,
          cronExpression: dto.cronExpression,
          misfirePolicy: dto.misfirePolicy || '1',
          concurrent: dto.concurrent || '1',
          status: dto.status || '0', // 默认创建为暂停状态
          remark: dto.remark,
        },
      });

      // 如果状态为运行中，则立即启动任务
      if (job.status === '1') {
        await this.executorService.startJob(job);
      }

      return job;
    } catch (error) {
      this.logger.error('创建定时任务失败', error);
      throw new BadRequestException('创建定时任务失败: ' + error.message);
    }
  }

  /**
   * 更新定时任务
   */
  async update(dto: UpdateScheduleJobDto) {
    try {
      // 获取旧任务信息
      const oldJob = await this.findById(dto.id);
      if (!oldJob) {
        throw new NotFoundException(`任务ID ${dto.id} 不存在`);
      }

      // 如果旧任务为运行状态，先停止
      if (oldJob.status === '1') {
        await this.executorService.stopJob(oldJob);
      }

      // 更新任务记录
      const updatedJob = await this.prisma.scheduleJob.update({
        where: { id: dto.id },
        data: {
          jobName: dto.jobName,
          jobGroup: dto.jobGroup,
          invokeTarget: dto.invokeTarget,
          cronExpression: dto.cronExpression,
          misfirePolicy: dto.misfirePolicy,
          concurrent: dto.concurrent,
          status: dto.status,
          remark: dto.remark,
          updatedAt: new Date(),
        },
      });

      // 如果更新后的状态为运行中，则重新启动任务
      if (updatedJob.status === '1') {
        await this.executorService.startJob(updatedJob);
      }

      return updatedJob;
    } catch (error) {
      this.logger.error('更新定时任务失败', error);
      throw new BadRequestException('更新定时任务失败: ' + error.message);
    }
  }

  /**
   * 删除定时任务
   */
  async delete(id: number) {
    try {
      // 获取任务信息
      const job = await this.findById(id);
      if (!job) {
        throw new NotFoundException(`任务ID ${id} 不存在`);
      }

      // 检查是否为系统默认数据
      if (job.isSystem === '1') {
        throw new BadRequestException('系统默认任务无法删除');
      }

      // 如果任务处于运行状态，先停止
      if (job.status === '1') {
        await this.executorService.stopJob(job);
      }

      // 删除任务记录
      await this.prisma.scheduleJob.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error('删除定时任务失败', error);
      throw new BadRequestException('删除定时任务失败: ' + error.message);
    }
  }

  /**
   * 更新任务状态：启用或禁用
   */
  async updateStatus(id: number, status: string) {
    try {
      // 获取任务信息
      const job = await this.findById(id);
      if (!job) {
        throw new NotFoundException(`任务ID ${id} 不存在`);
      }

      // 如果状态相同，不做操作
      if (job.status === status) {
        return job;
      }

      // 如果当前为运行状态，需要先停止
      if (job.status === '1') {
        await this.executorService.stopJob(job);
      }

      // 更新状态
      const updatedJob = await this.prisma.scheduleJob.update({
        where: { id },
        data: { status, updatedAt: new Date() },
      });

      // 如果更新后为运行状态，启动任务
      if (updatedJob.status === '1') {
        await this.executorService.startJob(updatedJob);
      }

      return updatedJob;
    } catch (error) {
      this.logger.error('更新任务状态失败', error);
      throw new BadRequestException('更新任务状态失败: ' + error.message);
    }
  }

  /**
   * 手动执行一次任务
   */
  async runJobOnce(id: number) {
    try {
      // 获取任务信息
      const job = await this.findById(id);
      if (!job) {
        throw new NotFoundException(`任务ID ${id} 不存在`);
      }

      // 执行任务
      const result = await this.executorService.runJobOnce(job);
      if (!result) {
        throw new BadRequestException('手动执行任务失败');
      }
      
      return true;
    } catch (error) {
      this.logger.error(`手动执行任务失败`, error);
      throw new BadRequestException('手动执行任务失败: ' + error.message);
    }
  }

  /**
   * 根据ID查找任务
   */
  async findById(id: number) {
    return this.prisma.scheduleJob.findUnique({
      where: { id },
    });
  }

  /**
   * 分页查询定时任务
   */
  async findByPage(query: QueryScheduleJobDto) {
    const { jobName, jobGroup, status, page = 1, pageSize = 10 } = query;
    
    // 确保页码和每页条数为数字
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);
    
    // 构建查询条件
    const where: any = {};
    if (jobName) {
      where.jobName = { contains: jobName };
    }
    if (jobGroup) {
      where.jobGroup = jobGroup;
    }
    if (status) {
      where.status = status;
    }

    // 查询总数
    const total = await this.prisma.scheduleJob.count({ where });

    // 分页查询
    const data = await this.prisma.scheduleJob.findMany({
      where,
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      orderBy: { id: 'desc' },
    });

    return {
      list: data,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
    };
  }

  /**
   * 获取任务日志分页列表
   */
  async getJobLogs(jobId: number, page = 1, pageSize = 10) {
    return this.logService.getJobLogs(jobId, page, pageSize);
  }

  /**
   * 清空任务日志
   */
  async clearJobLogs(jobId?: number) {
    return this.logService.clearJobLogs(jobId);
  }
}