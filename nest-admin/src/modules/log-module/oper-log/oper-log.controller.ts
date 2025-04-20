import { Controller, Get, Post, Body, Delete, Query, ParseIntPipe, Logger } from '@nestjs/common';
import { OperLogService } from './oper-log.service';
import { CreateOperLogDto, QueryOperLogDto, BatchDeleteDto } from './dto';
import Result from '../../../common/utils/result';

/**
 * 操作日志控制器
 */
@Controller('operLogs')
export class OperLogController {
  private readonly logger = new Logger(OperLogController.name);

  constructor(private readonly operLogService: OperLogService) {}

  /**
   * 添加操作日志
   * @param createOperLogDto - 创建操作日志数据传输对象
   * @returns 创建的操作日志对象
   */
  @Post('add')
  async add(@Body() createOperLogDto: CreateOperLogDto) {
    try {
      const data = await this.operLogService.create(createOperLogDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加操作日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取操作日志列表（分页）
   * @param query - 查询参数
   * @returns 分页的操作日志列表
   */
  @Get('list')
  async getList(@Query() queryDto: QueryOperLogDto) {
    try {
      const data = await this.operLogService.findAll(queryDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`查询操作日志列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取操作日志详情
   * @param id - 日志ID
   * @returns 操作日志详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.operLogService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取操作日志详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除操作日志
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.operLogService.batchDelete(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除操作日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 清空所有操作日志
   * @returns 操作结果
   */
  @Delete('clear')
  async clear() {
    try {
      await this.operLogService.clear();
      return Result.success();
    } catch (error) {
      this.logger.error(`清空操作日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}