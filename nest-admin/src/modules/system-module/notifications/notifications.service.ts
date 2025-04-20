import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 通知服务
 * 处理通知相关的业务逻辑
 */
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建通知
   * @param createNotificationDto 创建通知DTO
   * @returns 创建的通知对象
   */
  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto
    });
  }

  /**
   * 分页查询通知列表
   * @param queryNotificationDto 查询参数
   * @returns 分页通知列表
   */
  async findAll(queryNotificationDto: QueryNotificationDto) {
    const { keyword, type } = queryNotificationDto;
    const { skip, take } = queryNotificationDto;

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } }
      ];
    }

    if (type) {
      where.type = type;
    }

    // 查询总数
    const total = await this.prisma.notification.count({ where });

    // 查询数据
    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: notifications,
      meta: {
        page: queryNotificationDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 根据ID查询通知
   * @param id 通知ID
   * @returns 通知详情
   */
  async findOne(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`ID为${id}的通知不存在`);
    }

    return notification;
  }

  /**
   * 更新通知
   * @param id 通知ID
   * @param updateNotificationDto 更新参数
   * @returns 更新后的通知
   */
  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    // 检查是否存在
    await this.findOne(id);

    // 更新通知
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 操作结果
   */
  async remove(id: number) {
    // 检查是否存在
    await this.findOne(id);

    // 删除通知
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}