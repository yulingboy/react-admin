import { Controller, Get, Post, Body, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { ScheduleJobService } from './schedule-job.service';
import { CreateScheduleJobDto, UpdateScheduleJobDto, QueryScheduleJobDto } from './dto/schedule-job.dto';

@Controller('system/schedule-job')
export class ScheduleJobController {
  constructor(private readonly scheduleJobService: ScheduleJobService) {}

  /**
   * 创建定时任务
   */
  @Post()
  async create(@Body() createDto: CreateScheduleJobDto) {
    return this.scheduleJobService.create(createDto);
  }

  /**
   * 更新定时任务
   */
  @Put()
  async update(@Body() updateDto: UpdateScheduleJobDto) {
    return this.scheduleJobService.update(updateDto);
  }

  /**
   * 删除定时任务
   */
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.scheduleJobService.delete(id) };
  }

  /**
   * 获取定时任务详情
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleJobService.findById(id);
  }

  /**
   * 获取定时任务分页列表
   */
  @Get()
  async findAll(@Query() query: QueryScheduleJobDto) {
    return this.scheduleJobService.findByPage(query);
  }

  /**
   * 启动定时任务
   */
  @Put(':id/start')
  async startJob(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleJobService.updateStatus(id, '1');
  }

  /**
   * 停止定时任务
   */
  @Put(':id/stop')
  async stopJob(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleJobService.updateStatus(id, '0');
  }

  /**
   * 执行一次定时任务
   */
  @Post(':id/run-once')
  async runJobOnce(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.scheduleJobService.runJobOnce(id) };
  }

  /**
   * 获取任务日志
   */
  @Get(':id/logs')
  async getJobLogs(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.scheduleJobService.getJobLogs(id, page, pageSize);
  }

  /**
   * 清空指定任务的日志
   */
  @Delete(':id/logs')
  async clearJobLogs(@Param('id', ParseIntPipe) id: number) {
    return { success: await this.scheduleJobService.clearJobLogs(id) };
  }

  /**
   * 清空所有任务日志
   */
  @Delete('logs/clear-all')
  async clearAllJobLogs() {
    return { success: await this.scheduleJobService.clearJobLogs() };
  }
}