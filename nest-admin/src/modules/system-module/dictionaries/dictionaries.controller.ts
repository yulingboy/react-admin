import { Controller, Get, Post, Body, Delete, ParseIntPipe, Query, Logger, Put } from '@nestjs/common';
import { DictionariesService } from './dictionaries.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import Result from 'src/common/utils/result';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * 字典管理控制器
 * 提供字典和字典项的增删改查接口
 * @class DictionariesController
 * @constructor
 * @param {DictionariesService} dictionariesService - 字典服务
 */
@Controller('dictionaries')
export class DictionariesController {
  private readonly logger = new Logger(DictionariesController.name);

  constructor(private readonly dictionariesService: DictionariesService) { }

  /**
   * 添加字典
   * @param createDictionaryDto - 创建字典数据传输对象
   * @returns 创建的字典对象
   */
  @Post('add')
  async add(@Body() createDictionaryDto: CreateDictionaryDto) {
    await this.dictionariesService.create(createDictionaryDto);
    return Result.success();
  }


  /**
   * 获取字典列表（分页）
   * @param query - 查询参数
   * @returns 分页的字典列表
   */
  @Get('list')
  async getList(@Query() query: QueryDictionaryDto) {
    const data = await this.dictionariesService.findAll(query);
    return Result.success(data);

  }

  /**
   * 获取字典详情
   * @param id - 字典ID
   * @returns 字典详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {

    const data = await this.dictionariesService.findOne(id);
    return Result.success(data);

  }

  /**
   * 根据编码查询字典
   * @param code - 字典编码
   * @returns 字典详情
   */
  @Get('getByCode')
  async getByCode(@Query('code') code: string) {
    const data = await this.dictionariesService.findByCode(code);
    return Result.success(data);

  }

  /**
   * 更新字典
   * @param updateDictionaryDto - 更新字典数据传输对象
   * @returns 更新后的字典
   */
  @Put('update')
  async update(@Body() updateDictionaryDto: UpdateDictionaryDto) {
    await this.dictionariesService.update(updateDictionaryDto.id, updateDictionaryDto);
    return Result.success();

  }

  /**
   * 删除字典
   * @param id - 字典ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    await this.dictionariesService.remove(id);
    return Result.success();

  }



  /**
   * 获取所有可用的字典类型列表
   * 用于前端下拉选择
   * @returns 字典类型列表
   */
  @Get('all')
  async getAllDictionaries() {
    const data = await this.dictionariesService.findAllDictionaries();
    return Result.success(data);

  }

  /**
   * 获取字典项列表
   * @param dictionaryId - 字典ID
   * @returns 字典项列表
   */
  @Get('items')
  async getItems(@Query('dictionaryId', ParseIntPipe) dictionaryId: number) {
    const data = await this.dictionariesService.findItems(dictionaryId);
    return Result.success(data);

  }

  /**
   * 根据字典编码获取字典项列表
   * @param code - 字典编码
   * @returns 字典项列表
   */
  @Public()
  @Get('itemsByCode')
  async getItemsByCode(@Query('code') code: string) {

    const data = await this.dictionariesService.findItemsByCode(code);
    return Result.success(data);

  }

  /**
   * 添加字典项
   * @param createDictionaryItemDto - 创建字典项数据传输对象
   * @returns 创建的字典项对象
   */
  @Post('item/add')
  async addItem(@Body() createDictionaryItemDto: CreateDictionaryItemDto) {
    const data = await this.dictionariesService.createItem(createDictionaryItemDto);
    return Result.success();
  }

  /**
   * 更新字典项
   * @param updateDictionaryItemDto - 更新字典项数据传输对象
   * @returns 更新后的字典项
   */
  @Put('item/update')
  async updateItem(@Body() updateDictionaryItemDto: UpdateDictionaryItemDto) {

    const data = await this.dictionariesService.updateItem(updateDictionaryItemDto.id, updateDictionaryItemDto);
    return Result.success(data);

  }

  /**
   * 删除字典项
   * @param id - 字典项ID
   * @returns 操作结果
   */
  @Delete('item/delete')
  async deleteItem(@Query('id', ParseIntPipe) id: number) {

    await this.dictionariesService.removeItem(id);
    return Result.success();

  }
}
