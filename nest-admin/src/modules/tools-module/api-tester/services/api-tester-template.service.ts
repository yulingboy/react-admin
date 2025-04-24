import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTestTemplateCreateDto, ApiTestTemplateUpdateDto } from '../dto';
import { ApiTesterBaseService } from './api-tester-base.service';

/**
 * API测试模板服务
 * 处理API测试的模板管理
 */
@Injectable()
export class ApiTesterTemplateService extends ApiTesterBaseService {
  /**
   * 创建API测试模板
   * @param data 模板数据
   * @param userId 当前用户ID
   * @returns 创建的模板
   */
  async createTemplate(data: ApiTestTemplateCreateDto, userId: number) {
    return this.prisma.apiTestTemplate.create({
      data: {
        ...data,
        headers: data.headers as any,
        params: data.params as any,
        body: data.body as any,
        userId,
      },
    });
  }

  /**
   * 获取API测试模板列表
   * @param query 查询参数
   * @param userId 当前用户ID
   * @returns 模板列表和总数
   */
  async getTemplateList(query: { name?: string; current?: number | string; pageSize?: number | string }, userId: number) {
    // 确保将字符串类型的参数转换为数字类型
    const current = typeof query.current === 'string' ? parseInt(query.current, 10) : (query.current || 1);
    const pageSize = typeof query.pageSize === 'string' ? parseInt(query.pageSize, 10) : (query.pageSize || 10);
    const { name } = query;
    
    // 计算分页跳过的记录数
    const skip = (current - 1) * pageSize;

    // 构建过滤条件
    const where: any = { userId };

    if (name) {
      where.name = { contains: name };
    }

    // 查询总数
    const total = await this.prisma.apiTestTemplate.count({ where });

    // 查询列表，确保skip和take参数为数字类型
    const list = await this.prisma.apiTestTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: skip,
      take: pageSize,
    });

    return { total, list };
  }

  /**
   * 获取API测试模板详情
   * @param id 模板ID
   * @param userId 当前用户ID
   * @returns 模板详情
   */
  async getTemplateDetail(id: number, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return template;
  }

  /**
   * 更新API测试模板
   * @param id 模板ID
   * @param data 模板数据
   * @param userId 当前用户ID
   * @returns 更新后的模板
   */
  async updateTemplate(id: number, data: ApiTestTemplateUpdateDto, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权修改', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestTemplate.update({
      where: { id },
      data: {
        ...data,
        headers: data.headers as any,
        params: data.params as any,
        body: data.body as any,
      },
    });
  }

  /**
   * 删除API测试模板
   * @param id 模板ID
   * @param userId 当前用户ID
   * @returns 删除结果
   */
  async deleteTemplate(id: number, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权删除', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestTemplate.delete({
      where: { id },
    });
  }
}