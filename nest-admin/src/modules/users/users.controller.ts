import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import Result from 'src/common/utils/result';

/**
 * 用户管理控制器
 */
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  /**
   * 添加用户
   * @param createUserDto - 创建用户数据传输对象
   * @returns 创建的用户对象（不包含密码）
   */
  @Post('add')
  async add(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return Result.success(data);
  }

  /**
   * 获取用户列表（分页）
   * @param query - 查询参数
   * @returns 分页的用户列表
   */
  @Get('list')
  async getList(@Query() query: QueryUserDto) {
    const data = await this.usersService.findAll(query);
    return Result.success(data);
  }

  /**
   * 获取用户详情
   * @param id - 用户ID
   * @returns 用户详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findOneById(id);
    return Result.success(data);
  }

  /**
   * 更新用户
   * @param updateUserDto - 更新用户数据传输对象
   * @returns 更新后的用户
   */
  @Put('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(updateUserDto.id, updateUserDto);
    return Result.success();
  }

  /**
   * 删除用户
   * @param id - 用户ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return Result.success();
  }
}
