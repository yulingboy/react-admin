import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BillsCreateService } from './services/bills-create.service';
import { BillsQueryService } from './services/bills-query.service';
import { BillsUpdateService } from './services/bills-update.service';
import { BillsDeleteService } from './services/bills-delete.service';
import { BillsStatisticsService } from './services/bills-statistics.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';

/**
 * 账单服务
 * 负责协调各个子服务完成账单相关的业务逻辑
 */
@Injectable()
export class BillsService {
  // 注入各个子服务
  constructor(
    private readonly prisma: PrismaService,
    private readonly createService: BillsCreateService,
    private readonly queryService: BillsQueryService,
    private readonly updateService: BillsUpdateService,
    private readonly deleteService: BillsDeleteService,
    private readonly statisticsService: BillsStatisticsService,
  ) {}

  /**
   * 创建账单
   * @param createBillDto 创建账单DTO
   * @param userId 用户ID
   * @returns 创建的账单对象
   */
  async create(createBillDto: CreateBillDto, userId: number) {
    return this.createService.create(createBillDto, userId);
  }

  /**
   * 分页查询账单列表
   * @param queryBillDto 查询参数
   * @param userId 用户ID
   * @returns 分页账单列表
   */
  async findAll(queryBillDto: QueryBillDto, userId: number) {
    return this.queryService.findAll(queryBillDto, userId);
  }

  /**
   * 根据ID查询账单
   * @param id 账单ID
   * @param userId 用户ID
   * @returns 账单详情
   */
  async findOne(id: number, userId: number) {
    return this.queryService.findOne(id, userId);
  }

  /**
   * 更新账单
   * @param id 账单ID
   * @param updateBillDto 更新参数
   * @param userId 用户ID
   * @returns 更新后的账单
   */
  async update(id: number, updateBillDto: UpdateBillDto, userId: number) {
    return this.updateService.update(id, updateBillDto, userId);
  }

  /**
   * 物理删除账单，包含业务校验逻辑
   * @param id 账单ID
   * @param userId 用户ID
   * @returns 操作结果
   */
  async remove(id: number, userId: number) {
    return this.deleteService.remove(id, userId);
  }

  /**
   * 批量物理删除账单，包含业务校验逻辑
   * @param ids 账单ID数组
   * @param userId 用户ID
   * @returns 操作结果
   */
  async batchRemove(ids: number[], userId: number) {
    return this.deleteService.batchRemove(ids, userId);
  }

  /**
   * 获取账单统计数据
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据对象
   */
  async getStatistics(userId: number, startDate: string, endDate: string) {
    return this.statisticsService.getStatistics(userId, startDate, endDate);
  }
}