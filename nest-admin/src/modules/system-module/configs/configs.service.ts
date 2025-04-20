import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

@Injectable()
export class ConfigsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建配置
   * @param createConfigDto 创建配置DTO
   * @returns 创建的配置对象
   */
  async create(createConfigDto: CreateConfigDto) {
    // 检查配置键名是否已存在
    const existingConfig = await this.findByKey(createConfigDto.key);
    if (existingConfig) {
      throw new ConflictException(`配置键 ${createConfigDto.key} 已存在`);
    }
    
    const config = await this.prisma.config.create({
      data: createConfigDto,
    });
    return config;
  }

  /**
   * 分页查询配置列表
   * @param queryConfigDto 查询参数
   * @returns 分页配置列表
   */
  async findAll(queryConfigDto: QueryConfigDto) {
    const { keyword, group, isSystem, status } = queryConfigDto;
    const { skip, take } = queryConfigDto;

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { key: { contains: keyword } },
        { description: { contains: keyword } },
        { value: { contains: keyword } },
      ];
    }

    if (group !== undefined) {
      where.group = group;
    }

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    if (status !== undefined) {
      where.status = status;
    }

    // 查询总数
    const total = await this.prisma.config.count({ where });

    // 查询数据
    const configs = await this.prisma.config.findMany({
      where,
      skip,
      take,
      orderBy: { sort: 'asc' },
    });

    // 格式化结果
    return {
      items: configs,
      meta: {
        page: queryConfigDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取所有配置组选项
   * @returns 配置组选项列表
   */
  async findAllGroups() {
    const groups = await this.prisma.config.groupBy({
      by: ['group'],
      where: {
        group: {
          not: null,
        },
      },
    });

    return groups.map(item => item.group);
  }

  /**
   * 根据ID查询配置
   * @param id 配置ID
   * @returns 配置详情
   */
  async findOne(id: number) {
    const config = await this.prisma.config.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`ID为${id}的配置不存在`);
    }

    return config;
  }

  /**
   * 更新配置
   * @param id 配置ID
   * @param updateConfigDto 更新参数
   * @returns 更新后的配置
   */
  async update(id: number, updateConfigDto: UpdateConfigDto) {
    // 如果更新了key，需要确保key唯一
    if (updateConfigDto.key) {
      const existingConfig = await this.prisma.config.findFirst({
        where: {
          key: updateConfigDto.key,
          id: { not: id }
        }
      });
      
      if (existingConfig) {
        throw new ConflictException(`配置键 ${updateConfigDto.key} 已存在`);
      }
    }
    
    // 更新配置
    const config = await this.prisma.config.update({
      where: { id },
      data: updateConfigDto,
    });
    return config;
  }

  /**
   * 物理删除配置，包含业务校验逻辑
   * @param id 配置ID
   * @returns 操作结果
   */
  async remove(id: number) {
    // 校验是否存在
    const config = await this.findOne(id);
    if (!config) {
      throw new NotFoundException(`配置不存在`);
    }

    // 校验是否是系统配置
    if (config.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统配置无法删除`);
    }

    // 物理删除配置
    return await this.prisma.config.delete({
      where: { id },
    });
  }

  /**
   * 批量物理删除配置，包含业务校验逻辑
   * @param ids 配置ID数组
   * @returns 操作结果
   */
  async batchRemove(ids: number[]) {
    // 检查配置是否存在
    const configs = await this.prisma.config.findMany({
      where: { id: { in: ids } },
    });

    if (configs.length !== ids.length) {
      throw new NotFoundException(`部分配置不存在`);
    }

    // 检查是否包含系统配置
    const systemConfigs = configs.filter((config) => config.isSystem === IsSystemEnum.YES);
    if (systemConfigs.length > 0) {
      throw new ForbiddenException(`系统配置不允许删除`);
    }

    // 批量物理删除
    return this.prisma.config.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * 根据配置键名查询配置
   * @param key 配置键名
   * @returns 配置对象或null
   */
  async findByKey(key: string) {
    return this.prisma.config.findUnique({ where: { key } });
  }

  /**
   * 根据配置键名查询有效配置值
   * @param key 配置键名
   * @returns 配置值
   */
  async getConfigValue(key: string) {
    const config = await this.prisma.config.findFirst({
      where: { 
        key, 
        status: StatusEnum.ENABLED
      }
    });

    if (!config) {
      return null;
    }

    // 根据type转换值的类型
    switch (config.type) {
      case 'number':
        return Number(config.value);
      case 'boolean':
        return config.value === 'true';
      case 'json':
        try {
          return JSON.parse(config.value);
        } catch (e) {
          return config.value;
        }
      default:
        return config.value;
    }
  }
}
