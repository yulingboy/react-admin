import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateBillTagDto } from './dto/create-bill-tag.dto';
import { UpdateBillTagDto } from './dto/update-bill-tag.dto';
import { QueryBillTagDto } from './dto/query-bill-tag.dto';
import { StatusEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class BillTagsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建账单标签
   * @param createBillTagDto 创建账单标签DTO
   * @param userId 用户ID
   * @returns 创建的账单标签对象
   */
  async create(createBillTagDto: CreateBillTagDto, userId: number) {
    // 设置用户ID
    createBillTagDto.userId = userId;
    
    // 检查标签名称是否已存在
    const existingTag = await this.findByName(createBillTagDto.name, userId);
    if (existingTag) {
      throw new ConflictException(`标签名称 ${createBillTagDto.name} 已存在`);
    }
    
    // 将DTO转换为Prisma可接受的格式
    const tagData = {
      name: createBillTagDto.name,
      color: createBillTagDto.color,
      description: createBillTagDto.description,
      userId: createBillTagDto.userId,
      useCount: 0, // 初始使用次数为0
      // 如果DTO中有这些属性，则使用DTO中的值
      ...(createBillTagDto.status && { status: createBillTagDto.status }),
      ...(createBillTagDto.sort !== undefined && { sort: createBillTagDto.sort }),
    };
    
    const tag = await this.prisma.billTag.create({
      data: tagData,
    });
    
    return tag;
  }

  /**
   * 分页查询账单标签列表
   * @param queryBillTagDto 查询参数
   * @param userId 用户ID
   * @returns 分页账单标签列表
   */
  async findAll(queryBillTagDto: QueryBillTagDto, userId: number) {
    const { keyword, status } = queryBillTagDto;
    const { skip, take } = queryBillTagDto;

    // 构建查询条件
    const where: any = { userId };

    if (keyword) {
      where.name = { contains: keyword };
    }
    
    // 查询总数
    const total = await this.prisma.billTag.count({ where });

    // 查询数据
    const tags = await this.prisma.billTag.findMany({
      where,
      skip,
      take,
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { 
            BillTagLink: true
          },
        },
      },
    });

    // 格式化结果
    const formattedTags = tags.map((tag) => ({
      ...tag,
      usageCount: tag._count?.BillTagLink || 0,
      _count: undefined,
    }));

    return {
      items: formattedTags,
      meta: {
        page: queryBillTagDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取所有账单标签（用于下拉选择）
   * @param userId 用户ID
   * @returns 所有账单标签列表
   */
  async findAllOptions(userId: number) {
    return await this.prisma.billTag.findMany({
      where: { 
        userId
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据ID查询账单标签
   * @param id 账单标签ID
   * @param userId 用户ID
   * @returns 账单标签详情
   */
  async findOne(id: number, userId: number) {
    const tag = await this.prisma.billTag.findFirst({
      where: { 
        id,
        userId
      },
      include: {
        _count: {
          select: { 
            BillTagLink: true 
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`ID为${id}的账单标签不存在`);
    }

    // 格式化结果
    return {
      ...tag,
      usageCount: tag._count?.BillTagLink || 0,
      _count: undefined,
    };
  }

  /**
   * 更新账单标签
   * @param id 账单标签ID
   * @param updateBillTagDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单标签
   */
  async update(id: number, updateBillTagDto: UpdateBillTagDto, userId: number) {
    // 检查标签是否存在
    await this.findOne(id, userId);
    
    // 如果更新了名称，检查名称是否已存在
    if (updateBillTagDto.name) {
      const existingTag = await this.prisma.billTag.findFirst({
        where: {
          name: updateBillTagDto.name,
          userId,
          id: { not: id },
        },
      });
      
      if (existingTag) {
        throw new ConflictException(`标签名称 ${updateBillTagDto.name} 已存在`);
      }
    }
    
    // 更新账单标签
    const tag = await this.prisma.billTag.update({
      where: { id },
      data: updateBillTagDto,
    });
    
    return tag;
  }

  /**
   * 物理删除账单标签，包含业务校验逻辑
   * @param id 账单标签ID
   * @param userId 用户ID
   * @returns 操作结果
   */
  async remove(id: number, userId: number) {
    // 校验是否存在
    const tag = await this.findOne(id, userId);
    
    // 检查标签是否被使用
    if (tag.usageCount > 0) {
      throw new ForbiddenException(`该标签已被${tag.usageCount}个账单使用，无法删除`);
    }

    // 物理删除标签
    return await this.prisma.billTag.delete({
      where: { id },
    });
  }

  /**
   * 批量物理删除账单标签，包含业务校验逻辑
   * @param ids 账单标签ID数组
   * @param userId 用户ID
   * @returns 操作结果
   */
  async batchRemove(ids: number[], userId: number) {
    // 检查标签是否存在
    const tags = await this.prisma.billTag.findMany({
      where: { 
        id: { in: ids },
        userId,
      },
      include: {
        _count: {
          select: { 
            BillTagLink: true 
          },
        },
      },
    });

    if (tags.length !== ids.length) {
      throw new NotFoundException(`部分账单标签不存在`);
    }

    // 检查标签是否有关联账单
    const tagsInUse = tags.filter(tag => tag._count?.BillTagLink > 0);
    if (tagsInUse.length > 0) {
      throw new ForbiddenException(`选中的标签中有${tagsInUse.length}个正在被使用，不允许删除`);
    }

    // 批量物理删除
    return this.prisma.billTag.deleteMany({
      where: { 
        id: { in: ids },
        userId,
      },
    });
  }

  /**
   * 根据账单标签名查询账单标签
   * @param name 账单标签名
   * @param userId 用户ID
   * @returns 账单标签对象或null
   */
  async findByName(name: string, userId: number) {
    return this.prisma.billTag.findFirst({ 
      where: { 
        name,
        userId,
      } 
    });
  }
}