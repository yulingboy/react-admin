import { Controller, Post, Body, ParseIntPipe, Get, Query, Put, Delete, Logger } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import Result from 'src/common/utils/result';

/**
 * 配置管理控制器
 */
@Controller('configs')
export class ConfigsController {
  private readonly logger = new Logger(ConfigsController.name);

  constructor(private readonly configsService: ConfigsService) { }

  /**
   * 添加配置
   * @param createConfigDto - 创建配置数据传输对象
   * @returns 创建的配置对象
   */
  @Post('add')
  async add(@Body() createConfigDto: CreateConfigDto) {

    const data = await this.configsService.create(createConfigDto);
    return Result.success(data);

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

    const data = await this.configsService.findOne(id);
    return Result.success(data);
  }

  /**
   * 更新配置
   * @param updateConfigDto - 更新配置数据传输对象
   * @returns 更新后的配置
   */
  @Put('update')
  async update(@Body() updateConfigDto: UpdateConfigDto) {

    await this.configsService.update(updateConfigDto.id, updateConfigDto);
    return Result.success();

  }

  /**
   * 删除配置
   * @param id - 配置ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {

    await this.configsService.remove(id);
    return Result.success();

  }

  /**
   * 获取配置值
   * @param key - 配置键名
   * @returns 配置值
   */
  @Get('value')
  async getValue(@Query('key') key: string) {
    const value = await this.configsService.getConfigValue(key);
    return Result.success(value);

  }

  /**
   * 刷新配置缓存
   * 用于手动刷新Redis中的所有配置缓存
   * @returns 操作结果
   */
  @Post('refresh-cache')
  async refreshCache() {
    await this.configsService.refreshConfigCache();
    return Result.success(null, '配置缓存刷新成功');
  }
}
