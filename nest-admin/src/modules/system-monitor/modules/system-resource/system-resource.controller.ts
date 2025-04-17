import { Controller, Get, Query } from '@nestjs/common';
import { SystemResourceService } from './system-resource.service';
import { SystemResourcesQueryDto } from '../../dto/system-monitor.dto';

@Controller('system-monitor/resources')
export class SystemResourceController {
  constructor(private readonly systemResourceService: SystemResourceService) {}

  /**
   * 获取实时系统资源使用情况
   */
  @Get('realtime')
  async getSystemResourcesRealtime() {
    return this.systemResourceService.getSystemResourcesRealtime();
  }

  /**
   * 获取历史系统资源使用记录
   */
  @Get('history')
  async getSystemResourcesHistory(@Query() query: SystemResourcesQueryDto) {
    return this.systemResourceService.getSystemResourcesHistory(query);
  }

  /**
   * 获取系统概览数据（只包含资源部分）
   */
  @Get('overview')
  async getSystemResourceOverview() {
    return this.systemResourceService.getSystemResourcesRealtime();
  }
}