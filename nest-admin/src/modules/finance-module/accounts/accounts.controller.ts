import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { QueryAccountDto } from './dto/query-account.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { JwtAuthGuard } from '@/modules/auth-module/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

/**
 * 账户管理控制器
 */
@Controller('finance/accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(private readonly accountsService: AccountsService) {}

  /**
   * 添加账户
   * @param createAccountDto - 创建账户数据传输对象
   * @param req - 请求对象
   * @returns 创建的账户对象
   */
  @Post('add')
  async add(@Body() createAccountDto: CreateAccountDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.accountsService.create(createAccountDto, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加账户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账户列表（分页）
   * @param query - 查询参数
   * @param req - 请求对象
   * @returns 分页的账户列表
   */
  @Get('list')
  async getList(@Query() query: QueryAccountDto, @Req() req: RequestWithUser) {
    try {
      const data = await this.accountsService.findAll(query, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账户列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账户详情
   * @param id - 账户ID
   * @param req - 请求对象
   * @returns 账户详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      const data = await this.accountsService.findOne(id, req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账户详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新账户
   * @param updateAccountDto - 更新账户数据传输对象
   * @param req - 请求对象
   * @returns 更新后的账户
   */
  @Put('update')
  async update(@Body() updateAccountDto: UpdateAccountDto, @Req() req: RequestWithUser) {
    try {
      await this.accountsService.update(updateAccountDto.id, updateAccountDto, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新账户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 调整账户余额
   * @param adjustBalanceDto - 调整余额参数
   * @param req - 请求对象
   * @returns 更新后的账户
   */
  @Put('adjustBalance')
  async adjustBalance(@Body() adjustBalanceDto: AdjustBalanceDto, @Req() req: RequestWithUser) {
    try {
      await this.accountsService.adjustBalance(adjustBalanceDto, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`调整账户余额失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除账户
   * @param id - 账户ID
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    try {
      await this.accountsService.remove(id, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除账户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除账户
   * @param params - 批量删除参数
   * @param req - 请求对象
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto, @Req() req: RequestWithUser) {
    try {
      await this.accountsService.batchRemove(params.ids, req.user.id);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除账户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取所有账户 用于下拉选择
   * @param req - 请求对象
   * @returns 所有账户列表
   */
  @Get('options')
  async getOptions(@Req() req: RequestWithUser) {
    try {
      const data = await this.accountsService.findAllOptions(req.user.id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账户选项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}