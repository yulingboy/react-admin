import { Controller, Post, Body, ParseIntPipe, Logger, Get, Query, Put, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';

/**
 * 用户管理控制器
 * 提供用户的增删改查接口
 * @class UsersController
 * @constructor
 * @param {UsersService} usersService - 用户服务
 * @method add - 添加用户
 * @method getList - 获取用户列表
 * @method getDetail - 获取用户详情
 * @method update - 更新用户
 * @method delete - 删除用户
 * @method deleteBatch - 批量删除用户
 */
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * 添加用户
   * @param createUserDto - 创建用户数据传输对象
   * @returns 创建的用户对象（不包含密码）
   */
  @Post('add')
  async add(@Body() createUserDto: CreateUserDto) {
    try {
      const data = await this.usersService.create(createUserDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加用户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取用户列表（分页）
   * @param query - 查询参数
   * @returns 分页的用户列表
   */
  @Get('list')
  async getList(@Query() query: QueryUserDto) {
    try {
      const data = await this.usersService.findAll(query);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取用户列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取用户详情
   * @param id - 用户ID
   * @returns 用户详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.usersService.findOneById(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取用户详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新用户
   * @param updateUserDto - 更新用户数据传输对象
   * @returns 更新后的用户
   */
  @Put('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    try {
      const data = await this.usersService.update(updateUserDto.id, updateUserDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除用户
   * @param id - 用户ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.usersService.remove(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除用户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除用户
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.usersService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除用户失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}
