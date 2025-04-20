import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { Dictionary, DictionaryItem } from '@prisma/client';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * 字典管理服务类
 * 提供字典和字典项的增删改查业务逻辑和数据校验
 * @class DictionariesService
 * @constructor
 * @param {PrismaService} prisma - Prisma服务
 */
@Injectable()
export class DictionariesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.dictionary.create({
      data: createDictionaryDto,
    });
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

    return this.prisma.dictionary.update({
      where: { id },
      data: updateDictionaryDto,
    });
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
    // 检查字典是否存在
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { code },
    });

    if (!dictionary) {
      throw new NotFoundException(`字典编码:${code} 不存在`);
    }

    // 查询字典项列表
    return this.prisma.dictionaryItem.findMany({
      where: {
        dictionaryId: dictionary.id,
        status: StatusEnum.ENABLED, // 只返回启用状态的字典项
      },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    });
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

    return this.prisma.dictionaryItem.create({
      data: createDictionaryItemDto,
    });
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

    return this.prisma.dictionaryItem.update({
      where: { id },
      data: updateDictionaryItemDto,
    });
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

    return this.prisma.dictionaryItem.delete({
      where: { id },
    });
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

    return this.prisma.dictionaryItem.deleteMany({
      where: {
        id: { in: ids },
      },
    });
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
}
