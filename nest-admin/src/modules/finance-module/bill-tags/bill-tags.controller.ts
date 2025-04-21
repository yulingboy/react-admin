import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { BillTagsService } from './bill-tags.service';
import { CreateBillTagDto } from './dto/create-bill-tag.dto';
import { UpdateBillTagDto } from './dto/update-bill-tag.dto';
import { QueryBillTagDto } from './dto/query-bill-tag.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { JwtAuthGuard } from '@/modules/auth-module/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

/**
 * 账单标签管理控制器
 */
@Controller('finance/bill-tags')
@UseGuards(JwtAuthGuard)
export class BillTagsController {
  private readonly logger = new Logger(BillTagsController.name);

  constructor(private readonly billTagsService: BillTagsService) {}

  /**
   * 添加账单标签
   * @param createBillTagDto - 创建账单标签数据传输对象
   * @param req - 请求对象
   * @returns 创建的账单标签对象
   */
  @Post('add')
  async add(@Body() createBillTagDto: CreateBillTagDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billTagsService.create(createBillTagDto, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加账单标签失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单标签列表（分页）
   * @param query - 查询参数
   * @param req - 请求对象
   * @returns 分页的账单标签列表
   */
  @Get('list')
  async getList(@Query() query: QueryBillTagDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.billTagsService.findAll(query, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单标签列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账单标签详情
   * @param id - 账单标签ID
   * @param req - 请求对象
   * @returns 账单标签详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      const data = await this.billTagsService.findOne(id, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单标签详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新账单标签
   * @param updateBillTagDto - 更新账单标签数据传输对象
   * @param req - 请求对象
   * @returns 更新后的账单标签
   */
  @Put('update')
  async update(@Body() updateBillTagDto: UpdateBillTagDto, @Req() req: RequestWithUser) {
    try {
      await this.billTagsService.update(updateBillTagDto.id, updateBillTagDto, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新账单标签失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除账单标签
   * @param id - 账单标签ID
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      await this.billTagsService.remove(id, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除账单标签失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除账单标签
   * @param params - 批量删除参数
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto, @Req() req: RequestWithUser) {
    try {
      await this.billTagsService.batchRemove(params.ids, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除账单标签失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取所有账单标签 用于下拉选择
   * @param req - 请求对象
   * @returns 所有账单标签列表
   */
  @Get('options')
  async getOptions(@Req() req: RequestWithUser) {
    try {
      const data = await this.billTagsService.findAllOptions(req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账单标签选项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}