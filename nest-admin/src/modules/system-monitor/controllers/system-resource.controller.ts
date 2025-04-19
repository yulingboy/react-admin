import { Controller, Get, Query } from '@nestjs/common';
import { SystemResourceService } from '../modules/system-resource/system-resource.service';
import { SystemResourcesQueryDto } from '../dto/system-monitor.dto';

@Controller('system-monitor/resources')
export class SystemResourceController {
  constructor(
    private readonly systemResourceService: SystemResourceService,
  ) {}

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
   * 获取系统资源概览数据
   */
  @Get('overview')
  async getSystemResourcesOverview() {
    return this.systemResourceService.getSystemResourcesOverview();
  }
}