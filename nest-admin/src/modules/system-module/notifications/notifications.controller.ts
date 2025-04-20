import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import Result from 'src/common/utils/result';

/**
 * 通知管理控制器
 */
@Controller('notifications')
export class NotificationsController {

  constructor(private readonly notificationsService: NotificationsService) { }

  /**
   * 添加通知
   * @param createNotificationDto - 创建通知数据传输对象
   * @returns 创建的通知对象
   */
  @Post('add')
  async add(@Body() createNotificationDto: CreateNotificationDto) {

    const data = await this.notificationsService.create(createNotificationDto);
    return Result.success(data);

  }

  /**
   * 获取通知列表（分页）
   * @param query - 查询参数
   * @returns 分页的通知列表
   */
  @Get('list')
  async getList(@Query() query: QueryNotificationDto) {
    const data = await this.notificationsService.findAll(query);
    return Result.success(data);
  }

  /**
   * 获取通知详情
   * @param id - 通知ID
   * @returns 通知详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {

    const data = await this.notificationsService.findOne(id);
    return Result.success(data);

  }

  /**
   * 更新通知
   * @param updateNotificationDto - 更新通知数据传输对象
   * @returns 更新后的通知
   */
  @Put('update')
  async update(@Body() updateNotificationDto: UpdateNotificationDto) {

    await this.notificationsService.update(updateNotificationDto.id, updateNotificationDto);
    return Result.success();

  }

  /**
   * 删除通知
   * @param id - 通知ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {

    await this.notificationsService.remove(id);
    return Result.success();

  }
}