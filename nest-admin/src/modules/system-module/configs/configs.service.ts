import { Injectable, NotFoundException, ConflictException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigsService implements OnModuleInit {
  private readonly logger = new Logger(ConfigsService.name);
  // Redis缓存前缀
  private readonly REDIS_CONFIG_KEY_PREFIX = 'system:config:';
  // Redis缓存过期时间（24小时）
  private readonly REDIS_CONFIG_TTL = 86400;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) { }

  /**
   * 模块初始化时执行，预加载配置到Redis缓存
   */
  async onModuleInit() {
    try {
      this.logger.log('开始初始化配置缓存...');
      await this.refreshConfigCache();
      this.logger.log('配置缓存初始化完成');
    } catch (error) {
      this.logger.error('配置缓存初始化失败', error);
    }
  }

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

    // 如果是启用状态，则缓存到Redis
    if (config.status === StatusEnum.ENABLED) {
      await this.cacheConfigValue(config.key, config.value, config.type);
    }

    return config;
  }

  /**
   * 分页查询配置列表
   * @param queryConfigDto 查询参数
   * @returns 分页配置列表
   */
  async findAll(queryConfigDto: QueryConfigDto) {
    const { keyword, isSystem, status } = queryConfigDto;
    const { skip, take } = queryConfigDto;

    const where: Prisma.ConfigWhereInput = {
      ...(keyword && {
        OR: [
          { key: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      }),
      ...(isSystem !== undefined && { isSystem }),
      ...(status !== undefined && { status })
    };

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
    // 系统配置不允许修改
    const config = await this.findOne(id);
    if (config.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统配置无法修改`);
    }
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

    // 更新前缓存的键名
    const oldKey = config.key;

    // 更新配置
    const updatedConfig = await this.prisma.config.update({
      where: { id },
      data: updateConfigDto,
    });

    // 如果键名发生变化，需要删除旧缓存
    if (updateConfigDto.key && oldKey !== updatedConfig.key) {
      await this.clearConfigCache(oldKey);
    }

    // 更新或清除缓存
    if (updatedConfig.status === StatusEnum.ENABLED) {
      await this.cacheConfigValue(updatedConfig.key, updatedConfig.value, updatedConfig.type);
    } else {
      // 如果状态为禁用，则清除缓存
      await this.clearConfigCache(updatedConfig.key);
    }

    return updatedConfig;
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

    // 清除缓存
    await this.clearConfigCache(config.key);

    // 物理删除配置
    return await this.prisma.config.delete({
      where: { id },
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
    // 先从Redis缓存中查询
    const cachedValue = await this.getConfigFromCache(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // 缓存不存在，从数据库查询
    const config = await this.prisma.config.findFirst({
      where: {
        key,
        status: StatusEnum.ENABLED
      }
    });

    if (!config) {
      return null;
    }

    // 转换值类型
    const value = this.convertConfigValue(config.value, config.type);
    
    // 将查询结果缓存到Redis
    await this.cacheConfigValue(key, config.value, config.type);
    
    return value;
  }

  /**
   * 根据类型转换配置值
   * @param value 原始值
   * @param type 类型
   * @returns 转换后的值
   */
  private convertConfigValue(value: string, type: string) {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      default:
        return value;
    }
  }

  /**
   * 从Redis缓存中获取配置值
   * @param key 配置键名
   * @returns 配置值或null
   */
  private async getConfigFromCache(key: string): Promise<any> {
    const cacheKey = this.REDIS_CONFIG_KEY_PREFIX + key;
    return this.redisService.get(cacheKey);
  }

  /**
   * 将配置值缓存到Redis
   * @param key 配置键名
   * @param value 配置值
   * @param type 配置类型
   */
  private async cacheConfigValue(key: string, value: string, type: string): Promise<void> {
    const cacheKey = this.REDIS_CONFIG_KEY_PREFIX + key;
    const convertedValue = this.convertConfigValue(value, type);
    await this.redisService.set(cacheKey, convertedValue, this.REDIS_CONFIG_TTL);
  }

  /**
   * 清除配置缓存
   * @param key 配置键名
   */
  private async clearConfigCache(key: string): Promise<void> {
    const cacheKey = this.REDIS_CONFIG_KEY_PREFIX + key;
    await this.redisService.del(cacheKey);
  }

  /**
   * 刷新所有配置缓存
   * 可用于系统初始化时或手动刷新缓存
   */
  async refreshConfigCache(): Promise<void> {
    // 清除所有配置缓存
    const cachePattern = this.REDIS_CONFIG_KEY_PREFIX + '*';
    const keys = await this.redisService.keys(cachePattern);
    
    for (const key of keys) {
      await this.redisService.del(key);
    }

    // 重新缓存所有启用状态的配置
    const configs = await this.prisma.config.findMany({
      where: { status: StatusEnum.ENABLED },
    });

    for (const config of configs) {
      await this.cacheConfigValue(config.key, config.value, config.type);
    }
  }
}
