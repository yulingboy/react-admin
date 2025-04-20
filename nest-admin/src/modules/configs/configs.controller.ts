import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, Logger } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { BatchDeleteConfigDto } from './dto/batch-delete.dto';
import Result from 'src/common/utils/result';

/**
 * 配置管理控制器
 */
@Controller('configs')
export class ConfigsController {
  private readonly logger = new Logger(ConfigsController.name);

  constructor(private readonly configsService: ConfigsService) {}

  /**
   * 添加配置
   * @param createConfigDto - 创建配置数据传输对象
   * @returns 创建的配置对象
   */
  @Post('add')
  async add(@Body() createConfigDto: CreateConfigDto) {
    try {
      const data = await this.configsService.create(createConfigDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取配置列表（分页）
   * @param query - 查询参数
   * @returns 分页的配置列表
   */
  @Get('list')
  async getList(@Query() query: QueryConfigDto) {
    const data = await this.configsService.findAll(query);
    return Result.success(data);
  }

  /**
   * 获取配置详情
   * @param id - 配置ID
   * @returns 配置详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.configsService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取配置详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新配置
   * @param updateConfigDto - 更新配置数据传输对象
   * @returns 更新后的配置
   */
  @Put('update')
  async update(@Body() updateConfigDto: UpdateConfigDto) {
    try {
      await this.configsService.update(updateConfigDto.id, updateConfigDto);
      return Result.success();
    } catch (error) {
      this.logger.error(`更新配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除配置
   * @param id - 配置ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.configsService.remove(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除配置
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteConfigDto) {
    try {
      await this.configsService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
  
  /**
   * 获取所有配置组选项
   * @returns 配置组选项列表
   */
  @Get('groups')
  async getGroups() {
    const data = await this.configsService.findAllGroups();
    return Result.success(data);
  }

  /**
   * 获取配置值
   * @param key - 配置键名
   * @returns 配置值
   */
  @Get('value')
  async getValue(@Query('key') key: string) {
    try {
      const value = await this.configsService.getConfigValue(key);
      return Result.success(value);
    } catch (error) {
      this.logger.error(`获取配置值失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}
