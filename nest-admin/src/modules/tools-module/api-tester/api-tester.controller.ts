import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTesterService } from './api-tester.service';
import { 
  ApiTestRequestDto, 
  ApiTestHistoryQueryDto, 
  ApiTestTemplateCreateDto,
  ApiTestTemplateUpdateDto
} from './dto/api-tester.dto';
import { JwtAuthGuard } from '@/modules/auth-module/auth/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';

@Controller('api-tester')
export class ApiTesterController {
  constructor(
    private apiTesterService: ApiTesterService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('test')
  async testApi(@Body() data: ApiTestRequestDto, @User('id') userId: number) {
    return this.apiTesterService.testApi(data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Query() query: ApiTestHistoryQueryDto, @User('id') userId: number) {
    return this.apiTesterService.getHistory(query, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:id')
  async getHistoryDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getHistoryDetail(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history/:id')
  async deleteHistory(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteHistory(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history/batch')
  async batchDeleteHistory(@Body() body: { ids: number[] }, @User('id') userId: number) {
    return this.apiTesterService.batchDeleteHistory(body.ids, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('template')
  async createTemplate(@Body() data: ApiTestTemplateCreateDto, @User('id') userId: number) {
    return this.apiTesterService.createTemplate(data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('template')
  async getTemplateList(
    @Query() query: { name?: string; page?: number; pageSize?: number },
    @User('id') userId: number
  ) {
    return this.apiTesterService.getTemplateList(query, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('template/:id')
  async getTemplateDetail(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.getTemplateDetail(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('template/:id')
  async updateTemplate(
    @Param('id') id: number,
    @Body() data: ApiTestTemplateUpdateDto,
    @User('id') userId: number
  ) {
    return this.apiTesterService.updateTemplate(id, data, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('template/:id')
  async deleteTemplate(@Param('id') id: number, @User('id') userId: number) {
    return this.apiTesterService.deleteTemplate(id, userId);
  }
}