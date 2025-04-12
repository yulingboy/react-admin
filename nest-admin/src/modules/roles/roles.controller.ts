import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';


/**
 * 角色管理控制器
 * 提供角色的增删改查接口
 * @class RolesController
 * @constructor
 * @param {RolesService} rolesService - 角色服务
 * @method add - 添加角色
 * @method getList - 获取角色列表
 * @method getDetail - 获取角色详情
 * @method update - 更新角色
 * @method delete - 删除角色
 * @method deleteBatch - 批量删除角色
 */
@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);
  
  constructor(private readonly rolesService: RolesService) {}

  /**
   * 添加角色
   * @param createRoleDto - 创建角色数据传输对象
   * @returns 
   */
  @Post('add')
  async add(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.rolesService.create(createRoleDto);
    return Result.success(data);
  }

  /**
   * 获取角色列表
   * @param query - 查询参数
   * @returns 
   */
  @Get('list')
  async getList(@Query() query: QueryRoleDto) {
    return await this.rolesService.findPagationList(query);
  }

  /**
   * 获取角色详情
   * @param id - 角色ID
   * @returns 
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    const data = await this.rolesService.findOne(id);
    return Result.success(data);
  }

  /**
   * 更新角色
   * @param updateRoleDto - 更新角色数据传输对象
   * @returns 
   */
  @Put('update')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.rolesService.update(updateRoleDto.id, updateRoleDto);
    return Result.success(data);
  }

  /**
   * 删除角色
   * @param id - 角色ID
   * @returns 
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.rolesService.remove(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除角色失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除角色
   * @param params - 批量删除参数
   * @returns 
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.rolesService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除角色失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  /**
   * 获取所有角色 用于下拉选择
   * @returns 
   */
  @Get('options')
  async getOptions() {
    const data = await this.rolesService.findAllOptions();
    return Result.success(data);
  }
}
