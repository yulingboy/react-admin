import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { JwtAuthGuard } from '@/modules/auth-module/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

/**
 * 账单管理控制器
 */
@Controller('finance/bills')
@UseGuards(JwtAuthGuard)
export class BillsController {
  private readonly logger = new Logger(BillsController.name);

  constructor(private readonly billsService: BillsService) {}

  /**
   * 添加账单
   * @param createBillDto - 创建账单数据传输对象
   * @param req - 请求对象
   * @returns 创建的账单对象
   */
  @Post('add')
  async add(@Body() createBillDto: CreateBillDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billsService.create(createBillDto, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加账单失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单列表（分页）
   * @param query - 查询参数
   * @param req - 请求对象
   * @returns 分页的账单列表
   */
  @Get('list')
  async getList(@Query() query: QueryBillDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billsService.findAll(query, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单详情
   * @param id - 账单ID
   * @param req - 请求对象
   * @returns 账单详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      const data = await this.billsService.findOne(id, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新账单
   * @param updateBillDto - 更新账单数据传输对象
   * @param req - 请求对象
   * @returns 更新后的账单
   */
  @Put('update')
  async update(@Body() updateBillDto: UpdateBillDto, @Req() req: RequestWithUser) {
    try {
      await this.billsService.update(updateBillDto.id, updateBillDto, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新账单失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除账单
   * @param id - 账单ID
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      await this.billsService.remove(id, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除账单失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除账单
   * @param params - 批量删除参数
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto, @Req() req: RequestWithUser) {
    try {
      await this.billsService.batchRemove(params.ids, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除账单失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取账单统计数据
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param req - 请求对象
   * @returns 统计数据
   */
  @Get('statistics')
  async getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: RequestWithUser
  ) {
    try {
      if (!startDate || !endDate) {
        return Result.error('开始日期和结束日期不能为空');
      }
      
      const data = await this.billsService.getStatistics(req.user.id, startDate, endDate);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单统计数据失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}