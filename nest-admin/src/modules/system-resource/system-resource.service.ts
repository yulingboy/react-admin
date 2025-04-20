import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as si from 'systeminformation';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SystemResourceService {
  private readonly logger = new Logger(SystemResourceService.name);

  constructor(private prisma: PrismaService) {}

  // 每分钟收集一次系统资源数据
  @Cron(CronExpression.EVERY_MINUTE)
  async collectSystemResources() {
    try {
      const [cpuData, memData, diskData, timeData] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.time()
      ]);

      const cpuUsage = cpuData.currentLoad;
      const memUsage = (memData.used / memData.total) * 100;
      
      // 计算所有磁盘的平均使用率
      const diskUsage = diskData.reduce((sum, disk) => sum + disk.use, 0) / diskData.length;
      
      // 系统运行时间(秒)
      const uptime = timeData.uptime;

      await this.prisma.systemResource.create({
        data: {
          cpuUsage,
          memUsage,
          diskUsage,
          uptime,
        },
      });

      this.logger.log('系统资源数据已收集');
    } catch (error) {
      this.logger.error(`收集系统资源数据失败: ${error.message}`);
    }
  }

  // 获取最新的系统资源数据
  async getLatestResourceData() {
    return this.prisma.systemResource.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  // 获取历史系统资源数据
  async getHistoricalData(hours = 24) {
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - hours);

    return this.prisma.systemResource.findMany({
      where: {
        timestamp: {
          gte: fromDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }

  // 获取系统信息摘要
  async getSystemInfoSummary() {
    const [cpu, mem, osInfo, diskLayout, networkInterfaces] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout(),
      si.networkInterfaces(),
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
      },
      disks: diskLayout.map(disk => ({
        device: disk.device,
        type: disk.type,
        name: disk.name,
        size: disk.size,
      })),
      network: Array.isArray(networkInterfaces) 
        ? networkInterfaces.map(iface => ({
            iface: iface.iface,
            ip4: iface.ip4,
            mac: iface.mac,
            type: iface.type,
            speed: iface.speed,
          }))
        : [{
            iface: networkInterfaces.iface,
            ip4: networkInterfaces.ip4,
            mac: networkInterfaces.mac,
            type: networkInterfaces.type,
            speed: networkInterfaces.speed,
          }],
    };
  }

  // 清理旧数据 (保留最近30天的数据)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.systemResource.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`已清理 ${result.count} 条旧系统资源数据`);
    } catch (error) {
      this.logger.error(`清理旧系统资源数据失败: ${error.message}`);
    }
  }
}