import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { SystemResourceService } from './system-resource.service';

@Controller('system-resource')
export class SystemResourceController {
  constructor(private readonly systemResourceService: SystemResourceService) {}

  @Get('latest')
  async getLatestResourceData() {
    return this.systemResourceService.getLatestResourceData();
  }

  @Get('historical')
  async getHistoricalData(
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ) {
    return this.systemResourceService.getHistoricalData(hours);
  }

  @Get('system-info')
  async getSystemInfoSummary() {
    return this.systemResourceService.getSystemInfoSummary();
  }
}