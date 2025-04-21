import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AccountTypesService } from './account-types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { QueryAccountTypeDto } from './dto/query-account-type.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';

/**
 * 账户类型管理控制器
 */
@Controller('finance/account-types')
export class AccountTypesController {
  private readonly logger = new Logger(AccountTypesController.name);

  constructor(private readonly accountTypesService: AccountTypesService) {}

  /**
   * 添加账户类型
   * @param createAccountTypeDto - 创建账户类型数据传输对象
   * @returns 创建的账户类型对象
   */
  @Post('add')
  async add(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    try {
      const data = await this.accountTypesService.create(createAccountTypeDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加账户类型失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取账户类型列表（分页）
   * @param query - 查询参数
   * @returns 分页的账户类型列表
   */
  @Get('list')
  async getList(@Query() query: QueryAccountTypeDto) {
    const data = await this.accountTypesService.findAll(query);
    return Result.success(data);
  }

  /**
   * 获取账户类型详情
   * @param id - 账户类型ID
   * @returns 账户类型详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.accountTypesService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取账户类型详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新账户类型
   * @param updateAccountTypeDto - 更新账户类型数据传输对象
   * @returns 更新后的账户类型
   */
  @Put('update')
  async update(@Body() updateAccountTypeDto: UpdateAccountTypeDto) {
    try {
      await this.accountTypesService.update(updateAccountTypeDto.id, updateAccountTypeDto);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新账户类型失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除账户类型
   * @param id - 账户类型ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.accountTypesService.remove(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除账户类型失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除账户类型
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.accountTypesService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除账户类型失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取所有账户类型 用于下拉选择
   * @returns 所有账户类型列表
   */
  @Get('options')
  async getOptions() {
    const data = await this.accountTypesService.findAllOptions();
    return Result.success(data);
  }
}