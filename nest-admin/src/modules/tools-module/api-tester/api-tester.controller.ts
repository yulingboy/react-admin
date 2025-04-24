import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { ApiTesterService } from './api-tester.service';
import { 
  ApiTestRequestDto, 
  ApiTestHistoryQueryDto, 
  ApiTestTemplateCreateDto,
  ApiTestTemplateUpdateDto
} from './dto/api-tester.dto';
import { User } from '@/common/decorators/user.decorator';

@Controller('api-tester')
export class ApiTesterController {
  constructor(
    private apiTesterService: ApiTesterService
  ) {}

  @Post('test')
  async testApi(@Body() data: ApiTestRequestDto, @User('id') userId: number) {
    return this.apiTesterService.testApi(data, userId);
  }

  @Get('history')
  async getHistory(@Query() query: ApiTestHistoryQueryDto, @User('id') userId: number) {
    return this.apiTesterService.getHistory(query, userId);
  }

  @Get('history/:id')
  async getHistoryDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getHistoryDetail(id, userId);
  }

  @Delete('history/:id')
  async deleteHistory(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteHistory(id, userId);
  }

  @Delete('history/batch')
  async batchDeleteHistory(@Body() body: { ids: number[] }, @User('id') userId: number) {
    return this.apiTesterService.batchDeleteHistory(body.ids, userId);
  }

  @Post('template')
  async createTemplate(@Body() data: ApiTestTemplateCreateDto, @User('id') userId: number) {
    return this.apiTesterService.createTemplate(data, userId);
  }

  @Get('template')
  async getTemplateList(
    @Query() query: { name?: string; page?: number; pageSize?: number },
    @User('id') userId: number
  ) {
    return this.apiTesterService.getTemplateList(query, userId);
  }

  @Get('template/:id')
  async getTemplateDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getTemplateDetail(id, userId);
  }

  @Put('template/:id')
  async updateTemplate(
    @Param('id') id: number,
    @Body() data: ApiTestTemplateUpdateDto,
    @User('id') userId: number
  ) {
    return this.apiTesterService.updateTemplate(id, data, userId);
  }

  @Delete('template/:id')
  async deleteTemplate(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteTemplate(id, userId);
  }
}