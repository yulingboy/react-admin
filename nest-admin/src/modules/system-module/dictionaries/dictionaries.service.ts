import { Injectable, NotFoundException, ConflictException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { Dictionary, DictionaryItem } from '@prisma/client';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';

/**
 * 字典管理服务类
 * 提供字典和字典项的增删改查业务逻辑和数据校验
 * @class DictionariesService
 * @constructor
 * @param {PrismaService} prisma - Prisma服务
 * @param {RedisService} redisService - Redis服务
 */
@Injectable()
export class DictionariesService implements OnModuleInit {
  private readonly logger = new Logger(DictionariesService.name);
  // Redis缓存前缀
  private readonly REDIS_DICT_KEY_PREFIX = 'system:dictionary:';
  // Redis缓存过期时间（24小时）
  private readonly REDIS_DICT_TTL = 86400;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  /**
   * 模块初始化时执行，预加载字典到Redis缓存
   */
  async onModuleInit() {
    try {
      this.logger.log('开始初始化字典缓存...');
      await this.refreshDictionaryCache();
      this.logger.log('字典缓存初始化完成');
    } catch (error) {
      this.logger.error('字典缓存初始化失败', error);
    }
  }

  /**
   * 创建字典
   * @param createDictionaryDto 创建字典的数据传输对象
   * @returns 创建的字典对象
   * @throws {ConflictException} 当字典编码已存在时抛出异常
   */
  async create(createDictionaryDto: CreateDictionaryDto): Promise<Dictionary> {
    // 检查字典编码是否已存在
    const existDict = await this.prisma.dictionary.findUnique({
      where: { code: createDictionaryDto.code },
    });

    if (existDict) {
      throw new ConflictException(`字典编码 ${createDictionaryDto.code} 已存在`);
    }

    const dictionary = await this.prisma.dictionary.create({
      data: createDictionaryDto,
    });

    // 缓存新创建的字典项
    if (dictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(dictionary.code);
    }

    return dictionary;
  }

  /**
   * 分页查询字典列表
   * @param query 查询参数
   * @returns 分页的字典列表
   */
  async findAll(query: QueryDictionaryDto) {
    const { current = 1, pageSize = 10, code, name, status } = query;
    const skip = (current - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (code) {
      where.code = {
        contains: code,
      };
    }

    if (name) {
      where.name = {
        contains: name,
      };
    }

    if (status !== undefined) {
      where.status = status;
    }

    // 执行查询
    const [data, total] = await Promise.all([
      this.prisma.dictionary.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      this.prisma.dictionary.count({ where }),
    ]);

    // 格式化结果
    const formattedData = data.map((dict) => ({
      ...dict,
      itemCount: dict._count.items,
      _count: undefined,
    }));

    return {
      items: formattedData,
      meta: {
        page: current,
        pageSize: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 根据ID查询字典
   * @param id 字典ID
   * @returns 字典对象
   * @throws {NotFoundException} 当字典不存在时抛出异常
   */
  async findOne(id: number): Promise<Dictionary> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典ID:${id} 不存在`);
    }

    return dictionary;
  }

  /**
   * 根据编码查询字典
   * @param code 字典编码
   * @returns 字典对象
   * @throws {NotFoundException} 当字典不存在时抛出异常
   */
  async findByCode(code: string): Promise<Dictionary> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { code },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典编码:${code} 不存在`);
    }

    return dictionary;
  }

  /**
   * 更新字典
   * @param id 字典ID
   * @param updateDictionaryDto 更新字典的数据传输对象
   * @returns 更新后的字典对象
   * @throws {NotFoundException} 当字典不存在时抛出异常
   * @throws {ConflictException} 当新的字典编码已存在时抛出异常
   */
  async update(id: number, updateDictionaryDto: UpdateDictionaryDto): Promise<Dictionary> {
    // 检查字典是否存在
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典ID:${id} 不存在`);
    }

    // 如果更新code，需要检查code是否已存在
    if (updateDictionaryDto.code && updateDictionaryDto.code !== dictionary.code) {
      const existDict = await this.prisma.dictionary.findUnique({
        where: { code: updateDictionaryDto.code },
      });

      if (existDict) {
        throw new ConflictException(`字典编码 ${updateDictionaryDto.code} 已存在`);
      }
    }

    // 保存更新前的编码和状态，用于缓存管理
    const oldCode = dictionary.code;
    const oldStatus = dictionary.status;

    // 更新字典
    const updatedDictionary = await this.prisma.dictionary.update({
      where: { id },
      data: updateDictionaryDto,
    });

    // 如果编码发生变化，需要删除旧缓存
    if (updateDictionaryDto.code && oldCode !== updatedDictionary.code) {
      await this.clearDictionaryCache(oldCode);
    }

    // 更新或清除缓存
    if (updatedDictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(updatedDictionary.code);
    } else if (oldStatus === StatusEnum.ENABLED && updatedDictionary.status !== StatusEnum.ENABLED) {
      // 如果状态从启用变为禁用，则清除缓存
      await this.clearDictionaryCache(updatedDictionary.code);
    }

    return updatedDictionary;
  }

  /**
   * 删除字典
   * @param id 字典ID
   * @returns 删除结果
   * @throws {NotFoundException} 当字典不存在时抛出异常
   * @throws {ForbiddenException} 当尝试删除系统字典时抛出异常
   */
  async remove(id: number) {
    // 检查字典是否存在
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典ID:${id} 不存在`);
    }

    // 系统字典不允许删除
    if (dictionary.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统字典不允许删除`);
    }

    // 删除字典前清除缓存
    await this.clearDictionaryCache(dictionary.code);

    // 删除字典（级联删除字典项）
    return this.prisma.dictionary.delete({
      where: { id },
    });
  }

  /**
   * 批量删除字典
   * @param ids 字典ID数组
   * @returns 删除结果
   * @throws {ForbiddenException} 当尝试删除系统字典时抛出异常
   */
  async batchRemove(ids: number[]) {
    // 检查是否包含系统字典
    const systemDicts = await this.prisma.dictionary.findMany({
      where: {
        id: { in: ids },
        isSystem: IsSystemEnum.YES,
      },
    });

    if (systemDicts.length > 0) {
      throw new ForbiddenException(`系统字典不允许删除`);
    }

    // 查询要删除的字典，用于删除缓存
    const dictionaries = await this.prisma.dictionary.findMany({
      where: { id: { in: ids } },
      select: { code: true },
    });

    // 批量删除字典前清除缓存
    for (const dict of dictionaries) {
      await this.clearDictionaryCache(dict.code);
    }

    // 批量删除字典
    return this.prisma.dictionary.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  /**
   * 查询字典项列表
   * @param dictionaryId 字典ID
   * @returns 字典项列表
   */
  async findItems(dictionaryId: number): Promise<DictionaryItem[]> {
    // 检查字典是否存在
    await this.checkDictionaryExists(dictionaryId);

    // 查询字典项列表
    return this.prisma.dictionaryItem.findMany({
      where: { dictionaryId },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * 根据字典编码查询字典项列表
   * @param code 字典编码
   * @returns 字典项列表
   */
  async findItemsByCode(code: string): Promise<DictionaryItem[]> {
    // 尝试从缓存获取字典项
    const cachedItems = await this.getDictionaryItemsFromCache(code);
    if (cachedItems !== null) {
      this.logger.debug(`从缓存获取字典[${code}]项`);
      return cachedItems;
    }

    this.logger.debug(`从数据库获取字典[${code}]项`);
    
    // 检查字典是否存在
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { code },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典编码:${code} 不存在`);
    }

    // 查询字典项列表
    const items = await this.prisma.dictionaryItem.findMany({
      where: {
        dictionaryId: dictionary.id,
        status: StatusEnum.ENABLED, // 只返回启用状态的字典项
      },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });

    // 如果字典状态为启用，则缓存字典项
    if (dictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(code, items);
    }

    return items;
  }

  /**
   * 校验字典项编码是否已经存在
   * @param dictionaryId 字典ID
   * @param code 字典项编码
   * @param excludeId 排除的字典项ID（用于更新场景）
   * @returns 校验结果 true-存在，false-不存在
   */
  async checkItemCodeExists(dictionaryId: number, code: string, excludeId?: number): Promise<boolean> {
    const where: any = {
      dictionaryId,
      code,
    };

    // 更新场景下，排除自身ID
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.dictionaryItem.count({ where });
    return count > 0;
  }

  /**
   * 检查字典是否存在
   * @param id 字典ID
   * @returns 字典对象
   * @throws {NotFoundException} 当字典不存在时抛出异常
   */
  async checkDictionaryExists(id: number): Promise<Dictionary> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典ID:${id} 不存在`);
    }

    return dictionary;
  }

  /**
   * 创建字典项
   * @param createDictionaryItemDto 创建字典项的数据传输对象
   * @returns 创建的字典项对象
   * @throws {NotFoundException} 当字典不存在时抛出异常
   * @throws {ConflictException} 当字典项编码在同一字典下已存在时抛出异常
   * @throws {ForbiddenException} 当尝试在系统字典下创建字典项时抛出异常
   */
  async createItem(createDictionaryItemDto: CreateDictionaryItemDto): Promise<DictionaryItem> {
    // 检查字典是否存在
    const dictionary = await this.checkDictionaryExists(createDictionaryItemDto.dictionaryId);
    
    // 如果是系统字典，不允许新增字典项
    if (dictionary.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统字典不允许新增字典项`);
    }

    // 检查字典项编码在同一字典下是否已存在
    const exists = await this.checkItemCodeExists(
      createDictionaryItemDto.dictionaryId,
      createDictionaryItemDto.code
    );

    if (exists) {
      throw new ConflictException(`字典项编码 ${createDictionaryItemDto.code} 在当前字典下已存在`);
    }

    // 创建字典项
    const dictionaryItem = await this.prisma.dictionaryItem.create({
      data: createDictionaryItemDto,
    });

    // 如果字典为启用状态，刷新缓存
    if (dictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(dictionary.code);
    }

    return dictionaryItem;
  }

  /**
   * 更新字典项
   * @param id 字典项ID
   * @param updateDictionaryItemDto 更新字典项的数据传输对象
   * @returns 更新后的字典项对象
   * @throws {NotFoundException} 当字典项不存在时抛出异常
   * @throws {ConflictException} 当新的字典项编码在同一字典下已存在时抛出异常
   * @throws {ForbiddenException} 当尝试修改系统字典项时抛出异常
   */
  async updateItem(id: number, updateDictionaryItemDto: UpdateDictionaryItemDto): Promise<DictionaryItem> {
    // 检查字典项是否存在
    const item = await this.prisma.dictionaryItem.findUnique({
      where: { id },
      include: { dictionary: true },
    });

    if (!item) {
      throw new NotFoundException(`字典项ID:${id} 不存在`);
    }

    // 如果是系统字典，不允许修改字典项
    if (item.dictionary.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统字典项不允许修改`);
    }

    // 如果更新code，需要检查code是否已存在
    if (updateDictionaryItemDto.code && updateDictionaryItemDto.code !== item.code) {
      const exists = await this.checkItemCodeExists(
        item.dictionaryId, 
        updateDictionaryItemDto.code, 
        id
      );

      if (exists) {
        throw new ConflictException(`字典项编码 ${updateDictionaryItemDto.code} 在当前字典下已存在`);
      }
    }

    // 更新字典项
    const updatedItem = await this.prisma.dictionaryItem.update({
      where: { id },
      data: updateDictionaryItemDto,
    });

    // 如果字典状态为启用，刷新缓存
    if (item.dictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(item.dictionary.code);
    }

    return updatedItem;
  }

  /**
   * 删除字典项
   * @param id 字典项ID
   * @returns 删除结果
   * @throws {NotFoundException} 当字典项不存在时抛出异常
   * @throws {ForbiddenException} 当尝试删除系统字典项时抛出异常
   */
  async removeItem(id: number) {
    // 检查字典项是否存在
    const item = await this.prisma.dictionaryItem.findUnique({
      where: { id },
      include: { dictionary: true },
    });

    if (!item) {
      throw new NotFoundException(`字典项ID:${id} 不存在`);
    }

    // 如果是系统字典，不允许删除字典项
    if (item.dictionary.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统字典项不允许删除`);
    }

    // 删除字典项
    const result = await this.prisma.dictionaryItem.delete({
      where: { id },
    });

    // 如果字典状态为启用，刷新缓存
    if (item.dictionary.status === StatusEnum.ENABLED) {
      await this.cacheDictionaryItems(item.dictionary.code);
    }

    return result;
  }

  /**
   * 批量删除字典项
   * @param ids 字典项ID数组
   * @returns 删除结果
   * @throws {ForbiddenException} 当尝试删除系统字典项时抛出异常
   */
  async batchRemoveItems(ids: number[]) {
    // 检查是否包含系统字典下的字典项
    const systemItems = await this.prisma.dictionaryItem.findMany({
      where: {
        id: { in: ids },
        dictionary: { isSystem: IsSystemEnum.YES },
      },
    });

    if (systemItems.length > 0) {
      throw new ForbiddenException(`系统字典项不允许删除`);
    }

    // 获取要删除的字典项所属的字典编码，用于后续刷新缓存
    const dictionaryCodesResult = await this.prisma.dictionaryItem.findMany({
      where: { id: { in: ids } },
      select: {
        dictionary: {
          select: {
            code: true,
            status: true
          }
        }
      },
      distinct: ['dictionaryId']
    });

    // 批量删除字典项
    const result = await this.prisma.dictionaryItem.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // 对所有启用状态的字典刷新缓存
    for (const item of dictionaryCodesResult) {
      if (item.dictionary.status === StatusEnum.ENABLED) {
        await this.cacheDictionaryItems(item.dictionary.code);
      }
    }

    return result;
  }

  /**
   * 获取所有可用的字典类型
   * 用于前端字典类型下拉选择
   * @returns 可用的字典类型列表
   */
  async findAllDictionaries() {
    // 只返回启用状态的字典
    return this.prisma.dictionary.findMany({
      where: { status: StatusEnum.ENABLED },
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
      },
    });
  }

  /**
   * 从Redis缓存中获取字典项
   * @param code 字典编码
   * @returns 字典项列表或null
   */
  private async getDictionaryItemsFromCache(code: string): Promise<DictionaryItem[] | null> {
    const cacheKey = this.REDIS_DICT_KEY_PREFIX + code;
    return this.redisService.get(cacheKey);
  }

  /**
   * 将字典项缓存到Redis
   * @param code 字典编码
   * @param items 字典项列表(可选，不提供则从数据库查询)
   */
  private async cacheDictionaryItems(code: string, items?: DictionaryItem[]): Promise<void> {
    const cacheKey = this.REDIS_DICT_KEY_PREFIX + code;
    
    // 如果不提供items，则从数据库查询
    if (!items) {
      const dictionary = await this.prisma.dictionary.findUnique({
        where: { code },
      });

      if (!dictionary) {
        return;
      }

      items = await this.prisma.dictionaryItem.findMany({
        where: {
          dictionaryId: dictionary.id,
          status: StatusEnum.ENABLED, // 只缓存启用状态的字典项
        },
        orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      });
    }

    // 缓存字典项
    await this.redisService.set(cacheKey, items, this.REDIS_DICT_TTL);
  }

  /**
   * 清除字典缓存
   * @param code 字典编码
   */
  private async clearDictionaryCache(code: string): Promise<void> {
    const cacheKey = this.REDIS_DICT_KEY_PREFIX + code;
    await this.redisService.del(cacheKey);
  }

  /**
   * 刷新所有字典缓存
   * 可用于系统初始化时或手动刷新缓存
   */
  async refreshDictionaryCache(): Promise<void> {
    // 清除所有字典缓存
    const cachePattern = this.REDIS_DICT_KEY_PREFIX + '*';
    const keys = await this.redisService.keys(cachePattern);
    
    for (const key of keys) {
      await this.redisService.del(key);
    }

    // 查询所有启用状态的字典
    const dictionaries = await this.prisma.dictionary.findMany({
      where: { status: StatusEnum.ENABLED },
    });

    // 为每个字典重新缓存字典项
    for (const dictionary of dictionaries) {
      await this.cacheDictionaryItems(dictionary.code);
    }

    this.logger.log(`已刷新${dictionaries.length}个字典的缓存`);
  }
}
