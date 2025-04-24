import { Injectable } from '@nestjs/common';
import { ApiTesterRequestService } from './api-tester-request.service';
import { ApiTesterHistoryService } from './api-tester-history.service';
import { ApiTesterTemplateService } from './api-tester-template.service';
import { 
  ApiTestRequestDto, 
  ApiTestHistoryQueryDto,
  ApiTestTemplateCreateDto,
  ApiTestTemplateUpdateDto
} from '../dto';

/**
 * API测试综合服务
 * 整合API测试的各个子服务，提供统一的服务入口
 */
@Injectable()
export class ApiTesterService {
  constructor(
    private readonly requestService: ApiTesterRequestService,
    private readonly historyService: ApiTesterHistoryService,
    private readonly templateService: ApiTesterTemplateService
  ) {}

  // 请求相关方法
  testApi(data: ApiTestRequestDto, userId?: number) {
    return this.requestService.testApi(data, userId);
  }

  // 历史记录相关方法
  getHistory(query: ApiTestHistoryQueryDto, userId: number) {
    return this.historyService.getHistory(query, userId);
  }

  getHistoryDetail(id: number, userId: number) {
    return this.historyService.getHistoryDetail(id, userId);
  }

  deleteHistory(id: number, userId: number) {
    return this.historyService.deleteHistory(id, userId);
  }

  batchDeleteHistory(ids: number[], userId: number) {
    return this.historyService.batchDeleteHistory(ids, userId);
  }

  // 模板相关方法
  createTemplate(data: ApiTestTemplateCreateDto, userId: number) {
    return this.templateService.createTemplate(data, userId);
  }

  getTemplateList(query: { name?: string; current?: number; pageSize?: number }, userId: number) {
    return this.templateService.getTemplateList(query, userId);
  }

  getTemplateDetail(id: number, userId: number) {
    return this.templateService.getTemplateDetail(id, userId);
  }

  updateTemplate(id: number, data: ApiTestTemplateUpdateDto, userId: number) {
    return this.templateService.updateTemplate(id, data, userId);
  }

  deleteTemplate(id: number, userId: number) {
    return this.templateService.deleteTemplate(id, userId);
  }
}