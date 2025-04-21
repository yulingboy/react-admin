import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateBillCategoryDto } from './dto/create-bill-category.dto';
import { UpdateBillCategoryDto } from './dto/update-bill-category.dto';
import { QueryBillCategoryDto } from './dto/query-bill-category.dto';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class BillCategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建账单分类
   * @param createBillCategoryDto 创建账单分类DTO
   * @param userId 用户ID
   * @returns 创建的账单分类对象
   */
  async create(createBillCategoryDto: CreateBillCategoryDto, userId: number) {
    // 设置用户ID
    createBillCategoryDto.userId = userId;
    
    // 检查分类名称是否已存在
    const existingCategory = await this.findByNameAndType(
      createBillCategoryDto.name, 
      createBillCategoryDto.type,
      createBillCategoryDto.parentId,
      userId
    );
    
    if (existingCategory) {
      throw new ConflictException(`${createBillCategoryDto.type === 'income' ? '收入' : '支出'}分类名称 ${createBillCategoryDto.name} 已存在`);
    }
    
    // 如果有父分类，检查父分类是否存在且类型一致
    if (createBillCategoryDto.parentId > 0) {
      const parentCategory = await this.prisma.billCategory.findFirst({
        where: { 
          id: createBillCategoryDto.parentId,
          userId,
          type: createBillCategoryDto.type
        }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`父分类不存在或类型不匹配`);
      }
    }
    
    const category = await this.prisma.billCategory.create({
      data: createBillCategoryDto,
    });
    
    return category;
  }

  /**
   * 分页查询账单分类列表
   * @param queryBillCategoryDto 查询参数
   * @param userId 用户ID
   * @returns 分页账单分类列表
   */
  async findAll(queryBillCategoryDto: QueryBillCategoryDto, userId: number) {
    const { keyword, type, status, isSystem, parentId } = queryBillCategoryDto;
    const { skip, take } = queryBillCategoryDto;

    // 构建查询条件
    const where: any = {};
    
    // 用户可以查看自己创建的分类和系统内置分类
    where.OR = [
      { userId },
      { isSystem: IsSystemEnum.YES }
    ];

    if (keyword) {
      where.name = { contains: keyword };
    }

    if (type !== undefined && type !== '') {
      where.type = type;
    }
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }
    
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // 查询总数
    const total = await this.prisma.billCategory.count({ where });

    // 查询数据
    const categories = await this.prisma.billCategory.findMany({
      where,
      skip,
      take,
      orderBy: [
        { sort: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        _count: {
          select: { bills: true },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 格式化结果
    const formattedCategories = categories.map((category) => ({
      ...category,
      billCount: category._count.bills,
      _count: undefined,
    }));

    return {
      items: formattedCategories,
      meta: {
        page: queryBillCategoryDto.current,
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * 获取账单分类树形结构
   * @param type 分类类型(income: 收入, expense: 支出)
   * @param userId 用户ID
   * @returns 树形结构的账单分类列表
   */
  async findTree(type: string, userId: number) {
    const where: any = {
      status: StatusEnum.ENABLED,
      type,
      OR: [
        { userId },
        { isSystem: IsSystemEnum.YES }
      ]
    };
    
    // 先获取所有一级分类
    const parentCategories = await this.prisma.billCategory.findMany({
      where: {
        ...where,
        parentId: 0,
      },
      orderBy: { sort: 'asc' },
    });
    
    // 获取所有子分类
    const childCategories = await this.prisma.billCategory.findMany({
      where: {
        ...where,
        parentId: { not: 0 },
      },
      orderBy: { sort: 'asc' },
    });
    
    // 构建树形结构
    const result = parentCategories.map(parent => {
      const children = childCategories.filter(child => child.parentId === parent.id);
      return {
        ...parent,
        children: children.length > 0 ? children : undefined
      };
    });
    
    return result;
  }

  /**
   * 获取所有账单分类（用于下拉选择）
   * @param type 分类类型(income: 收入, expense: 支出)，不传则返回全部
   * @param userId 用户ID
   * @returns 账单分类列表
   */
  async findAllOptions(type: string | undefined, userId: number) {
    const where: any = {
      status: StatusEnum.ENABLED,
      OR: [
        { userId },
        { isSystem: IsSystemEnum.YES }
      ]
    };
    
    if (type) {
      where.type = type;
    }
    
    const categories = await this.prisma.billCategory.findMany({
      where,
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        type: true,
        parentId: true,
      },
      orderBy: [
        { parentId: 'asc' },
        { sort: 'asc' }
      ],
    });
    
    return categories;
  }

  /**
   * 根据ID查询账单分类
   * @param id 账单分类ID
   * @param userId 用户ID
   * @returns 账单分类详情
   */
  async findOne(id: number, userId: number) {
    const category = await this.prisma.billCategory.findFirst({
      where: { 
        id,
        OR: [
          { userId },
          { isSystem: IsSystemEnum.YES }
        ]
      },
      include: {
        _count: {
          select: { bills: true },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`ID为${id}的账单分类不存在`);
    }

    // 格式化结果
    return {
      ...category,
      billCount: category._count.bills,
      _count: undefined,
    };
  }

  /**
   * 更新账单分类
   * @param id 账单分类ID
   * @param updateBillCategoryDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单分类
   */
  async update(id: number, updateBillCategoryDto: UpdateBillCategoryDto, userId: number) {
    // 检查分类是否存在
    const category = await this.findOne(id, userId);
    
    // 系统内置的分类不允许修改某些字段
    if (category.isSystem === IsSystemEnum.YES && userId !== 0) {
      if (updateBillCategoryDto.name || updateBillCategoryDto.type) {
        throw new ForbiddenException(`系统内置分类不允许修改名称和类型`);
      }
    }
    
    // 如果修改了父分类，检查父分类是否存在且类型一致
    if (updateBillCategoryDto.parentId !== undefined && updateBillCategoryDto.parentId > 0) {
      const parentCategory = await this.prisma.billCategory.findFirst({
        where: { 
          id: updateBillCategoryDto.parentId,
          OR: [
            { userId },
            { isSystem: IsSystemEnum.YES }
          ],
          type: updateBillCategoryDto.type || category.type
        }
      });
      
      if (!parentCategory) {
        throw new NotFoundException(`父分类不存在或类型不匹配`);
      }
      
      // 检查是否将自己设为父分类
      if (updateBillCategoryDto.parentId === id) {
        throw new ForbiddenException(`不能将自己设为父分类`);
      }
      
      // 检查是否将自己的子分类设为父分类（防止循环）
      const childCategories = await this.prisma.billCategory.findMany({
        where: { parentId: id }
      });
      
      if (childCategories.some(child => child.id === updateBillCategoryDto.parentId)) {
        throw new ForbiddenException(`不能将子分类设为父分类，会导致循环引用`);
      }
    }
    
    // 如果更新了名称或类型，检查名称是否已存在
    if (updateBillCategoryDto.name || updateBillCategoryDto.type) {
      const type = updateBillCategoryDto.type || category.type;
      const name = updateBillCategoryDto.name || category.name;
      const parentId = updateBillCategoryDto.parentId !== undefined ? 
                       updateBillCategoryDto.parentId : category.parentId;
      
      const existingCategory = await this.prisma.billCategory.findFirst({
        where: {
          name,
          type,
          parentId,
          userId,
          id: { not: id },
        },
      });
      
      if (existingCategory) {
        throw new ConflictException(`${type === 'income' ? '收入' : '支出'}分类名称 ${name} 已存在`);
      }
    }
    
    // 如果不是用户自己的分类，则不允许修改
    if (category.userId !== userId && category.isSystem !== IsSystemEnum.YES) {
      throw new ForbiddenException(`无权修改他人的分类`);
    }
    
    // 将DTO转换为Prisma可接受的格式
    const categoryData = { ...updateBillCategoryDto };
    
    // 更新账单分类
    const updatedCategory = await this.prisma.billCategory.update({
      where: { id },
      data: categoryData,
    });
    
    return updatedCategory;
  }

  /**
   * 物理删除账单分类，包含业务校验逻辑
   * @param id 账单分类ID
   * @param userId 用户ID
   * @returns 操作结果
   */
  async remove(id: number, userId: number) {
    // 校验是否存在
    const category = await this.findOne(id, userId);
    
    // 系统内置的分类不允许删除
    if (category.isSystem === IsSystemEnum.YES) {
      throw new ForbiddenException(`系统内置分类不允许删除`);
    }
    
    // 如果不是用户自己的分类，则不允许删除
    if (category.userId !== userId) {
      throw new ForbiddenException(`无权删除他人的分类`);
    }
    
    // 检查分类是否有子分类
    const childCount = await this.prisma.billCategory.count({
      where: { parentId: id }
    });
    
    if (childCount > 0) {
      throw new ForbiddenException(`该分类有${childCount}个子分类，无法删除`);
    }

    // 检查分类是否被使用
    const billCount = await this.prisma.bill.count({
      where: { categoryId: id },
    });

    if (billCount > 0) {
      throw new ForbiddenException(`该分类已被${billCount}个账单使用，无法删除`);
    }

    // 物理删除分类
    return await this.prisma.billCategory.delete({
      where: { id },
    });
  }

  /**
   * 批量物理删除账单分类，包含业务校验逻辑
   * @param ids 账单分类ID数组
   * @param userId 用户ID
   * @returns 操作结果
   */
  async batchRemove(ids: number[], userId: number) {
    // 检查分类是否存在
    const categories = await this.prisma.billCategory.findMany({
      where: { 
        id: { in: ids },
        OR: [
          { userId },
          { isSystem: IsSystemEnum.YES }
        ]
      },
    });

    if (categories.length !== ids.length) {
      throw new NotFoundException(`部分账单分类不存在`);
    }

    // 检查是否包含系统内置分类
    const systemCategories = categories.filter(category => category.isSystem === IsSystemEnum.YES);
    if (systemCategories.length > 0) {
      throw new ForbiddenException(`选中的分类中包含${systemCategories.length}个系统内置分类，不允许删除`);
    }
    
    // 检查是否包含非用户自己的分类
    const otherUserCategories = categories.filter(category => category.userId !== userId);
    if (otherUserCategories.length > 0) {
      throw new ForbiddenException(`选中的分类中包含${otherUserCategories.length}个非您创建的分类，不允许删除`);
    }
    
    // 检查是否有子分类
    const categoriesWithChildren = await this.prisma.billCategory.findMany({
      where: { parentId: { in: ids } }
    });
    
    if (categoriesWithChildren.length > 0) {
      throw new ForbiddenException(`选中的分类中有${categoriesWithChildren.length}个子分类，不允许删除`);
    }

    // 检查分类是否有关联账单
    const billCount = await this.prisma.bill.count({
      where: { categoryId: { in: ids } },
    });

    if (billCount > 0) {
      throw new ForbiddenException(`选中的分类中有${billCount}个账单关联，不允许删除`);
    }

    // 批量物理删除
    return this.prisma.billCategory.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * 根据账单分类名查询账单分类
   * @param name 账单分类名
   * @param type 分类类型
   * @param parentId 父级分类ID
   * @param userId 用户ID
   * @returns 账单分类对象或null
   */
  async findByNameAndType(name: string, type: string, parentId: number = 0, userId: number) {
    return this.prisma.billCategory.findFirst({ 
      where: { 
        name,
        type,
        parentId,
        OR: [
          { userId },
          { isSystem: IsSystemEnum.YES }
        ]
      } 
    });
  }
}