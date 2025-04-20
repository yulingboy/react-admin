import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateScheduleJobDto, UpdateScheduleJobDto, QueryScheduleJobDto } from './dto/schedule-job.dto';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ScheduleJobService {
  private readonly logger = new Logger(ScheduleJobService.name);

  constructor(
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * 初始化定时任务
   * 系统启动时，从数据库加载所有状态为"运行中"的定时任务
   */
  async initJobs() {
    this.logger.log('正在初始化定时任务...');
    try {
      // 获取所有状态为"运行中"的定时任务
      const jobs = await this.prisma.scheduleJob.findMany({
        where: { status: '1' },
      });

      // 遍历并启动定时任务
      for (const job of jobs) {
        await this.startJob(job);
      }

      this.logger.log(`成功初始化 ${jobs.length} 个定时任务`);
    } catch (error) {
      this.logger.error('初始化定时任务失败', error);
    }
  }

  /**
   * 启动指定的定时任务
   */
  async startJob(job: any) {
    const { id, jobName, jobGroup, cronExpression, invokeTarget } = job;
    const cronJobName = `${jobGroup}:${jobName}:${id}`;

    try {
      // 创建定时任务
      const cronJob = new CronJob(cronExpression, async () => {
        await this.executeJob(job);
      });

      // 检查是否已存在同名任务，如果存在则先移除
      if (this.schedulerRegistry.getCronJobs().has(cronJobName)) {
        this.schedulerRegistry.deleteCronJob(cronJobName);
      }

      // 添加到定时任务注册表 - 适配不同版本的 cron 库
      this.schedulerRegistry.addCronJob(cronJobName, cronJob as any);
      
      // 启动定时任务
      cronJob.start();
      
      this.logger.log(`定时任务 [${cronJobName}] 启动成功`);
      return true;
    } catch (error) {
      this.logger.error(`定时任务 [${cronJobName}] 启动失败`, error);
      return false;
    }
  }

  /**
   * 停止指定的定时任务
   */
  async stopJob(id: number) {
    try {
      // 获取任务信息
      const job = await this.findById(id);
      if (!job) {
        throw new NotFoundException(`任务ID ${id} 不存在`);
      }

      const cronJobName = `${job.jobGroup}:${job.jobName}:${job.id}`;

      // 检查任务是否存在于注册表中
      if (this.schedulerRegistry.getCronJobs().has(cronJobName)) {
        this.schedulerRegistry.deleteCronJob(cronJobName);
        this.logger.log(`定时任务 [${cronJobName}] 已停止`);
      }

      return true;
    } catch (error) {
      this.logger.error(`停止定时任务失败`, error);
      return false;
    }
  }

  /**
   * 执行任务逻辑
   */
  async executeJob(job: any) {
    const startTime = new Date();
    let status = '1'; // 默认成功
    let jobMessage = '执行成功';
    let exceptionInfo = null;
    
    try {
      this.logger.log(`开始执行定时任务 [${job.jobGroup}:${job.jobName}:${job.id}]`);
      
      // TODO: 实现真正的任务执行逻辑，可以通过反射调用指定的方法
      // 这里仅作示例，记录日志表示任务已执行
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟任务执行

      this.logger.log(`定时任务 [${job.jobGroup}:${job.jobName}:${job.id}] 执行完成`);
    } catch (error) {
      status = '0'; // 执行失败
      jobMessage = '执行失败';
      exceptionInfo = error.message || JSON.stringify(error);
      this.logger.error(`定时任务 [${job.jobGroup}:${job.jobName}:${job.id}] 执行失败`, error);
    } finally {
      const endTime = new Date();
      
      // 记录任务执行日志
      await this.prisma.scheduleJobLog.create({
        data: {
          jobId: job.id,
          jobName: job.jobName,
          jobGroup: job.jobGroup,
          invokeTarget: job.invokeTarget,
          status,
          jobMessage,
          exceptionInfo,
          startTime,
          endTime,
        },
      });
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
      await this.executeJob(job);
      return true;
    } catch (error) {
      this.logger.error(`手动执行任务失败`, error);
      throw new BadRequestException('手动执行任务失败: ' + error.message);
    }
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
        await this.startJob(job);
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
        await this.stopJob(dto.id);
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
        await this.startJob(updatedJob);
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
        await this.stopJob(id);
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
        await this.stopJob(id);
      }

      // 更新状态
      const updatedJob = await this.prisma.scheduleJob.update({
        where: { id },
        data: { status, updatedAt: new Date() },
      });

      // 如果更新后为运行状态，启动任务
      if (updatedJob.status === '1') {
        await this.startJob(updatedJob);
      }

      return updatedJob;
    } catch (error) {
      this.logger.error('更新任务状态失败', error);
      throw new BadRequestException('更新任务状态失败: ' + error.message);
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
}