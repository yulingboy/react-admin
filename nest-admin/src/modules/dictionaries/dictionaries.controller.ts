import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query, Logger, Put } from '@nestjs/common';
import { DictionariesService } from './dictionaries.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { BatchDeleteDto } from './dto/batch-delete.dto';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import Result from 'src/common/utils/result';
import { Dictionary, DictionaryItem } from '@prisma/client';

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
  
  constructor(private readonly dictionariesService: DictionariesService) {}

  /**
   * 添加字典
   * @param createDictionaryDto - 创建字典数据传输对象
   * @returns 创建的字典对象
   */
  @Post('add')
  async add(@Body() createDictionaryDto: CreateDictionaryDto) {
    try {
      const data = await this.dictionariesService.create(createDictionaryDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加字典失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取字典列表（分页）
   * @param query - 查询参数
   * @returns 分页的字典列表
   */
  @Get('list')
  async getList(@Query() query: QueryDictionaryDto) {
    try {
      return await this.dictionariesService.findAll(query);
    } catch (error) {
      this.logger.error(`获取字典列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取字典详情
   * @param id - 字典ID
   * @returns 字典详情
   */
  @Get('detail')
  async getDetail(@Query('id', ParseIntPipe) id: number) {
    try {
      const data = await this.dictionariesService.findOne(id);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取字典详情失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 根据编码查询字典
   * @param code - 字典编码
   * @returns 字典详情
   */
  @Get('getByCode')
  async getByCode(@Query('code') code: string) {
    try {
      const data = await this.dictionariesService.findByCode(code);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`通过编码获取字典失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新字典
   * @param updateDictionaryDto - 更新字典数据传输对象
   * @returns 更新后的字典
   */
  @Put('update')
  async update(@Body() updateDictionaryDto: UpdateDictionaryDto) {
    try {
      const data = await this.dictionariesService.update(updateDictionaryDto.id, updateDictionaryDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`更新字典失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除字典
   * @param id - 字典ID
   * @returns 操作结果
   */
  @Delete('delete')
  async delete(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.dictionariesService.remove(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除字典失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除字典
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('deleteBatch')
  async deleteBatch(@Query() params: BatchDeleteDto) {
    try {
      await this.dictionariesService.batchRemove(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除字典失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取所有可用的字典类型列表
   * 用于前端下拉选择
   * @returns 字典类型列表
   */
  @Get('all')
  async getAllDictionaries() {
    try {
      const data = await this.dictionariesService.findAllDictionaries();
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取所有字典类型失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 获取字典项列表
   * @param dictionaryId - 字典ID
   * @returns 字典项列表
   */
  @Get('items')
  async getItems(@Query('dictionaryId', ParseIntPipe) dictionaryId: number) {
    try {
      const data = await this.dictionariesService.findItems(dictionaryId);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`获取字典项列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 根据字典编码获取字典项列表
   * @param code - 字典编码
   * @returns 字典项列表
   */
  @Get('itemsByCode')
  async getItemsByCode(@Query('code') code: string) {
    try {
      const data = await this.dictionariesService.findItemsByCode(code);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`通过编码获取字典项列表失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 添加字典项
   * @param createDictionaryItemDto - 创建字典项数据传输对象
   * @returns 创建的字典项对象
   */
  @Post('item/add')
  async addItem(@Body() createDictionaryItemDto: CreateDictionaryItemDto) {
    try {
      const data = await this.dictionariesService.createItem(createDictionaryItemDto);
      return Result.success(data);
    } catch (error) {
      this.logger.error(`添加字典项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 更新字典项
   * @param updateDictionaryItemDto - 更新字典项数据传输对象
   * @returns 更新后的字典项
   */
  @Put('item/update')
  async updateItem(@Body() updateDictionaryItemDto: UpdateDictionaryItemDto) {
    try {
      const data = await this.dictionariesService.updateItem(
        updateDictionaryItemDto.id,
        updateDictionaryItemDto
      );
      return Result.success(data);
    } catch (error) {
      this.logger.error(`更新字典项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 删除字典项
   * @param id - 字典项ID
   * @returns 操作结果
   */
  @Delete('item/delete')
  async deleteItem(@Query('id', ParseIntPipe) id: number) {
    try {
      await this.dictionariesService.removeItem(id);
      return Result.success();
    } catch (error) {
      this.logger.error(`删除字典项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }

  /**
   * 批量删除字典项
   * @param params - 批量删除参数
   * @returns 操作结果
   */
  @Delete('item/deleteBatch')
  async deleteBatchItems(@Query() params: BatchDeleteDto) {
    try {
      await this.dictionariesService.batchRemoveItems(params.ids);
      return Result.success();
    } catch (error) {
      this.logger.error(`批量删除字典项失败: ${error.message}`, error.stack);
      return Result.error(error.message);
    }
  }
}
