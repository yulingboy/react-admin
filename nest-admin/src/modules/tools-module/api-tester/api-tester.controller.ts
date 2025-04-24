import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { ApiTesterService } from './services';
import { 
  ApiTestRequestDto, 
  ApiTestHistoryQueryDto, 
  ApiTestTemplateCreateDto,
  ApiTestTemplateUpdateDto
} from './dto';
import { User } from '@/common/decorators/user.decorator';

/**
 * API测试控制器
 * 处理API测试相关的HTTP请求
 */
@Controller('api-tester')
export class ApiTesterController {
  constructor(
    private apiTesterService: ApiTesterService
  ) {}

  /**
   * 发送API测试请求
   * @param data 请求数据
   * @param userId 当前用户ID
   * @returns 请求响应结果
   */
  @Post('test')
  async testApi(@Body() data: ApiTestRequestDto, @User('id') userId: number) {
    return this.apiTesterService.testApi(data, userId);
  }

  /**
   * 获取API测试历史记录列表
   * @param query 查询参数
   * @param userId 当前用户ID
   * @returns 历史记录列表和总数
   */
  @Get('history')
  async getHistory(@Query() query: ApiTestHistoryQueryDto, @User('id') userId: number) {
    return this.apiTesterService.getHistory(query, userId);
  }

  /**
   * 获取API测试历史记录详情
   * @param id 历史记录ID
   * @param userId 当前用户ID
   * @returns 历史记录详情
   */
  @Get('history/:id')
  async getHistoryDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getHistoryDetail(id, userId);
  }

  /**
   * 删除API测试历史记录
   * @param id 历史记录ID
   * @param userId 当前用户ID
   * @returns 删除结果
   */
  @Delete('history/:id')
  async deleteHistory(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteHistory(id, userId);
  }

  /**
   * 批量删除API测试历史记录
   * @param body 包含ID数组的请求体
   * @param userId 当前用户ID
   * @returns 批量删除结果
   */
  @Delete('history/batch')
  async batchDeleteHistory(@Body() body: { ids: number[] }, @User('id') userId: number) {
    return this.apiTesterService.batchDeleteHistory(body.ids, userId);
  }

  /**
   * 创建API测试模板
   * @param data 模板数据
   * @param userId 当前用户ID
   * @returns 创建的模板
   */
  @Post('template')
  async createTemplate(@Body() data: ApiTestTemplateCreateDto, @User('id') userId: number) {
    return this.apiTesterService.createTemplate(data, userId);
  }

  /**
   * 获取API测试模板列表
   * @param query 查询参数
   * @param userId 当前用户ID
   * @returns 模板列表和总数
   */
  @Get('template')
  async getTemplateList(
    @Query() query: { name?: string; page?: number; pageSize?: number },
    @User('id') userId: number
  ) {
    return this.apiTesterService.getTemplateList(query, userId);
  }

  /**
   * 获取API测试模板详情
   * @param id 模板ID
   * @param userId 当前用户ID
   * @returns 模板详情
   */
  @Get('template/:id')
  async getTemplateDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getTemplateDetail(id, userId);
  }

  /**
   * 更新API测试模板
   * @param id 模板ID
   * @param data 更新数据
   * @param userId 当前用户ID
   * @returns 更新后的模板
   */
  @Put('template/:id')
  async updateTemplate(
    @Param('id') id: number,
    @Body() data: ApiTestTemplateUpdateDto,
    @User('id') userId: number
  ) {
    return this.apiTesterService.updateTemplate(id, data, userId);
  }

  /**
   * 删除API测试模板
   * @param id 模板ID
   * @param userId 当前用户ID
   * @returns 删除结果
   */
  @Delete('template/:id')
  async deleteTemplate(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteTemplate(id, userId);
  }
}