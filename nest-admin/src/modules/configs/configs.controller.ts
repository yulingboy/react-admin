import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, Logger } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { DataBaseDto } from 'src/common/dto/data-base.dto';
import { ParamsDto } from 'src/common/dto/params.dto';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import Result from 'src/common/utils/result';
import { BatchDeleteDto } from './dto/batch-delete.dto';

/**
 * 配置管理控制器
 * 提供系统配置的增删改查接口
 * @class ConfigsController
 * @constructor
 * @param {ConfigsService} configsService - 配置服务
 * @method add - 添加配置项
 * @method getList - 获取配置列表
 * @method getDetail - 获取配置详情
 * @method getByKey - 通过键名获取配置
 * @method update - 更新配置
 * @method delete - 删除配置
 * @method deleteBatch - 批量删除配置
 */
@Controller('configs')
export class ConfigsController {
  private readonly logger = new Logger(ConfigsController.name);

  constructor(private readonly configsService: ConfigsService) {}

  /**
   * 添加配置项
   * @param createConfigDto - 创建配置数据传输对象
   * @returns 创建的配置项
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
   * @returns 配置列表（分页）
   */
  @Post('list')
  async getList(@Body() query: QueryConfigDto): Promise<PaginatedDto<CreateConfigDto>> {
    try {
      return await this.configsService.findAll(query);
    } catch (error) {
      this.logger.error(`获取配置列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取配置详情
   * @param id - 配置ID
   * @returns 配置详情
   */
  @Post('detail')
  async getDetail(@Body('id', ParseIntPipe) id: number) {
    try {
      const data = await this.configsService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取配置详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 根据键名获取配置
   * @param key - 配置键名
   * @returns 配置详情
   */
  @Post('getByKey')
  async getByKey(@Body('key') key: string) {
    try {
      const data = await this.configsService.findByKey(key);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`通过键名获取配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新配置
   * @param updateConfigDto - 更新配置数据传输对象
   * @returns 更新后的配置
   */
  @Post('update')
  async update(@Body() updateConfigDto: UpdateConfigDto) {
    try {
      const data = await this.configsService.update(updateConfigDto.id, updateConfigDto);
      return Result.success(data);
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
  @Post('delete')
  async delete(@Body('id', ParseIntPipe) id: number) {
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
  @Post('deleteBatch')
  async deleteBatch(@Body() params: BatchDeleteDto) {
    try {
      await this.configsService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除配置失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}
