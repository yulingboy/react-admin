import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { BillCategoriesService } from './bill-categories.service';
import { CreateBillCategoryDto } from './dto/create-bill-category.dto';
import { UpdateBillCategoryDto } from './dto/update-bill-category.dto';
import { QueryBillCategoryDto } from './dto/query-bill-category.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { JwtAuthGuard } from '@/modules/auth-module/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

/**
 * 账单分类管理控制器
 */
@Controller('finance/bill-categories')
@UseGuards(JwtAuthGuard)
export class BillCategoriesController {
  private readonly logger = new Logger(BillCategoriesController.name);

  constructor(private readonly billCategoriesService: BillCategoriesService) {}

  /**
   * 添加账单分类
   * @param createBillCategoryDto - 创建账单分类数据传输对象
   * @param req - 请求对象
   * @returns 创建的账单分类对象
   */
  @Post('add')
  async add(@Body() createBillCategoryDto: CreateBillCategoryDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billCategoriesService.create(createBillCategoryDto, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加账单分类失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单分类列表（分页）
   * @param query - 查询参数
   * @param req - 请求对象
   * @returns 分页的账单分类列表
   */
  @Get('list')
  async getList(@Query() query: QueryBillCategoryDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billCategoriesService.findAll(query, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单分类列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单分类树形结构
   * @param type - 分类类型(income: 收入, expense: 支出)
   * @param req - 请求对象
   * @returns 树形结构的账单分类列表
   */
  @Get('tree')
  async getTree(@Query('type') type: string, @Req() req: RequestWithUser) {
    try {
      if (!type || !['income', 'expense'].includes(type)) {
        return Result.error('分类类型必须是income或expense');
      }
      
      const data = await this.billCategoriesService.findTree(type, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单分类树形结构失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单分类详情
   * @param id - 账单分类ID
   * @param req - 请求对象
   * @returns 账单分类详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      const data = await this.billCategoriesService.findOne(id, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单分类详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新账单分类
   * @param updateBillCategoryDto - 更新账单分类数据传输对象
   * @param req - 请求对象
   * @returns 更新后的账单分类
   */
  @Put('update')
  async update(@Body() updateBillCategoryDto: UpdateBillCategoryDto, @Req() req: RequestWithUser) {
    try {
      await this.billCategoriesService.update(updateBillCategoryDto.id, updateBillCategoryDto, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新账单分类失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除账单分类
   * @param id - 账单分类ID
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      await this.billCategoriesService.remove(id, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除账单分类失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除账单分类
   * @param params - 批量删除参数
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto, @Req() req: RequestWithUser) {
    try {
      await this.billCategoriesService.batchRemove(params.ids, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除账单分类失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取所有账单分类 用于下拉选择
   * @param type - 分类类型(income: 收入, expense: 支出)
   * @param req - 请求对象
   * @returns 所有账单分类列表
   */
  @Get('options')
  async getOptions(@Query('type') type: string, @Req() req: RequestWithUser) {
    try {
      const data = await this.billCategoriesService.findAllOptions(type, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单分类选项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}