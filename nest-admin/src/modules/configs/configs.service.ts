import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { Config } from '@prisma/client';
import { IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 配置管理服务类
 * 提供系统配置的增删改查业务逻辑和数据校验
 * @class ConfigsService
 * @constructor
 * @param {PrismaService} prisma - Prisma服务
 */
@Injectable()
export class ConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建配置
   * @param createConfigDto 创建配置的数据传输对象
   * @returns 创建的配置对象
   * @throws {ForbiddenException} 当配置键已存在时抛出异常
   */
  async create(createConfigDto: CreateConfigDto) {
    // 检查key是否存在
    const existConfig = await this.prisma.config.findUnique({
      where: { key: createConfigDto.key },
    });

    if (existConfig) {
      throw new ForbiddenException(`配置键 ${createConfigDto.key} 已存在`);
    }

    return this.prisma.config.create({
      data: createConfigDto,
    });
  }

  /**
   * 分页查询配置列表
   * @param query 查询参数
   * @returns 分页的配置列表
   */
  async findAll(query: QueryConfigDto): Promise<PaginatedDto<Config>> {
    const { current = 1, pageSize = 10, key, group, status } = query;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: any = {};
    if (key) {
      where.key = {
        contains: key,
      };
    }
    if (group) {
      where.group = group;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.config.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { sort: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.config.count({ where }),
    ]);

    return {
      rows: data,
      total
    };
  }

  /**
   * 根据ID查询配置
   * @param id 配置ID
   * @returns 配置对象
   * @throws {NotFoundException} 当配置不存在时抛出异常
   */
  async findOne(id: number) {
    const config = await this.prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`配置ID:${id} 不存在`);
    }

    return config;
  }

  /**
   * 根据key查询配置
   * @param key 配置键名
   * @returns 配置对象
   * @throws {NotFoundException} 当配置不存在时抛出异常
   */
  async findByKey(key: string) {
    const config = await this.prisma.config.findUnique({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`配置键:${key} 不存在`);
    }

    return config;
  }

  /**
   * 更新配置
   * @param id 配置ID
   * @param updateConfigDto 更新配置的数据传输对象
   * @returns 更新后的配置对象
   * @throws {NotFoundException} 当配置不存在时抛出异常
   * @throws {ForbiddenException} 当新的配置键已存在时抛出异常
   */
  async update(id: number, updateConfigDto: UpdateConfigDto) {
    // 检查配置是否存在
    const config = await this.prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`配置ID:${id} 不存在`);
    }

    // 如果更新key，需要检查key是否已存在
    if (updateConfigDto.key && updateConfigDto.key !== config.key) {
      const existConfig = await this.prisma.config.findUnique({
        where: { key: updateConfigDto.key },
      });

      if (existConfig) {
        throw new ForbiddenException(`配置键 ${updateConfigDto.key} 已存在`);
      }
    }

    return this.prisma.config.update({
      where: { id },
      data: updateConfigDto,
    });
  }

  /**
   * 删除配置
   * @param id 配置ID
   * @returns 删除结果
   * @throws {NotFoundException} 当配置不存在时抛出异常
   * @throws {ForbiddenException} 当尝试删除系统配置时抛出异常
   */
  async remove(id: number) {
    // 检查配置是否存在
    const config = await this.prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`配置ID:${id} 不存在`);
    }

    // 系统配置不允许删除
    if (config.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统配置不允许删除`);
    }

    return this.prisma.config.delete({
      where: { id },
    });
  }

  /**
   * 批量删除配置
   * @param ids 配置ID数组
   * @returns 删除结果
   * @throws {ForbiddenException} 当尝试删除系统配置时抛出异常
   */
  async batchRemove(ids: number[]) {
    // 检查是否包含系统配置
    const systemConfigs = await this.prisma.config.findMany({
      where: {
        id: { in: ids },
        isSystem: IsSystemEnum.YES,
      },
    });

    if (systemConfigs.length > 0) {
      throw new ForbiddenException(`系统配置不允许删除`);
    }

    return this.prisma.config.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}