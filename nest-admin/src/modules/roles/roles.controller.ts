import { Controller, Get, Post, Body, Query, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Controller('roles')
export class RolesController {
  /**
   * 构造函数，注入角色服务
   * @param rolesService 角色服务实例
   */
  constructor(private readonly rolesService: RolesService) {}

  /**
   * 创建角色
   * @POST /roles/create
   * @param createRoleDto 创建角色参数
   * @returns 创建结果
   */
  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * 分页查询角色列表
   * @GET /roles/list
   * @param queryRoleDto 查询参数
   * @returns 分页角色列表
   */
  @Get('list')
  findAll(@Query() queryRoleDto: QueryRoleDto) {
    return this.rolesService.findAll(queryRoleDto);
  }

  /**
   * 获取所有角色选项（用于下拉框）
   * @GET /roles/options
   * @returns 所有可用角色
   */
  @Get('options')
  findAllOptions() {
    return this.rolesService.findAllOptions();
  }

  /**
   * 查询单个角色
   * @GET /roles/detail
   * @param id 角色ID
   * @returns 角色详情
   */
  @Get('detail')
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  /**
   * 更新角色
   * @POST /roles/update
   * @param updateRoleDto 更新参数(包含id)
   * @returns 更新结果
   */
  @Post('update')
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  /**
   * 删除角色
   * @POST /roles/delete
   * @param id 角色ID
   * @returns 删除结果
   */
  @Post('delete')
  remove(@Body('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
