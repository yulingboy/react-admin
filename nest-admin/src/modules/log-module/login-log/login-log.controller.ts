import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, Logger } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { CreateLoginLogDto, QueryLoginLogDto, BatchDeleteDto } from './dto';
import Result from '../../../common/utils/result';

/**
 * 登录日志控制器
 */
@Controller('loginLogs')
export class LoginLogController {
  private readonly logger = new Logger(LoginLogController.name);

  constructor(private readonly loginLogService: LoginLogService) {}

  /**
   * 添加登录日志
   * @param createLoginLogDto - 创建登录日志数据传输对象
   * @returns 创建的登录日志对象
   */
  @Post('add')
  async add(@Body() createLoginLogDto: CreateLoginLogDto) {
    try {
      const data = await this.loginLogService.create(createLoginLogDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加登录日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取登录日志列表（分页）
   * @param query - 查询参数
   * @returns 分页的登录日志列表
   */
  @Get('list')
  async getList(@Query() queryDto: QueryLoginLogDto) {
    try {
      const data = await this.loginLogService.findAll(queryDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`查询登录日志列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取登录日志详情
   * @param id - 日志ID
   * @returns 登录日志详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.loginLogService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取登录日志详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除登录日志
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.loginLogService.batchDelete(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除登录日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 清空所有登录日志
   * @returns 操作结果
   */
  @Delete('clear')
  async clear() {
    try {
      await this.loginLogService.clear();
      return Result.success();
    } catch (error) {
      this.logger.error(`清空登录日志失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}