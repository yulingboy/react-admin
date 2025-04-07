import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Controller('users')
export class UsersController {
  /**
   * 构造函数，注入用户服务
   * @param usersService 用户服务实例
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * 创建用户
   * @POST /users/create
   * @param createUserDto 创建用户参数
   * @returns 创建结果
   */
  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * 分页查询用户列表
   * @GET /users/list
   * @param queryUserDto 查询参数
   * @returns 分页用户列表
   */
  @Get('list')
  findAll(@Query() queryUserDto: QueryUserDto) {
    return this.usersService.findAll(queryUserDto);
  }

  /**
   * 查询单个用户
   * @GET /users/detail
   * @param id 用户ID
   * @returns 用户详情
   */
  @Get('detail')
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * 更新用户
   * @POST /users/update
   * @param updateUserDto 更新参数(包含id)
   * @returns 更新结果
   */
  @Post('update')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  /**
   * 删除用户
   * @DELETE /users/delete
   * @param id 用户ID
   * @returns 删除结果
   */
  @Delete('delete')
  delete(@Body('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
