import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../../shared/prisma/prisma.service';

/**
 * 定时任务执行器服务
 * 负责定时任务的初始化、启动、停止和执行
 */
@Injectable()
export class ScheduleJobExecutorService {
  private readonly logger = new Logger(ScheduleJobExecutorService.name);

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
  async stopJob(job: any) {
    try {
      if (!job) {
        return false;
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
  async runJobOnce(job: any) {
    try {
      if (!job) {
        return false;
      }
      
      // 执行任务
      await this.executeJob(job);
      return true;
    } catch (error) {
      this.logger.error(`手动执行任务失败`, error);
      return false;
    }
  }
}