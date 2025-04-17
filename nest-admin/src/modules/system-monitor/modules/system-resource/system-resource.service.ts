import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { SystemResourcesQueryDto } from '../../dto/system-monitor.dto';
import * as os from 'os';
import * as si from 'systeminformation';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SystemResourceService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取实时系统资源使用情况
   */
  async getSystemResourcesRealtime() {
    const cpuUsage = await this.getCpuUsage();
    const memUsage = await this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const uptime = os.uptime();
    const systemInfo = await this.getSystemInfo();

    return {
      cpuUsage,
      memUsage,
      diskUsage,
      uptime,
      systemInfo,
      timestamp: new Date(),
    };
  }

  /**
   * 获取历史系统资源使用记录
   */
  async getSystemResourcesHistory(query: SystemResourcesQueryDto) {
    const { startDate, endDate, limit = 100 } = query;
    
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.timestamp = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.timestamp = {
        lte: new Date(endDate),
      };
    }

    const resources = await this.prisma.systemResource.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return resources;
  }

  /**
   * 定时收集系统资源使用情况 - 每5分钟执行一次
   */
  @Cron('0 */5 * * * *')
  async collectSystemResources() {
    try {
      const cpuUsage = await this.getCpuUsage();
      const memUsage = await this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();
      const uptime = os.uptime();

      await this.prisma.systemResource.create({
        data: {
          cpuUsage,
          memUsage,
          diskUsage,
          uptime,
        },
      });
      
      console.log(`[${new Date().toISOString()}] 系统资源监控数据已收集`);
    } catch (error) {
      console.error('收集系统资源监控数据失败:', error);
    }
  }

  /**
   * 获取CPU使用率
   */
  private async getCpuUsage(): Promise<number> {
    try {
      const load = await si.currentLoad();
      return load.currentLoad / 100; // 转换为0-1之间的小数
    } catch (error) {
      console.error('Failed to get CPU usage:', error);
      return 0;
    }
  }

  /**
   * 获取内存使用率
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      const mem = await si.mem();
      return mem.used / mem.total; // 转换为0-1之间的小数
    } catch (error) {
      console.error('Failed to get memory usage:', error);
      return this.getFallbackMemoryUsage();
    }
  }

  /**
   * 获取内存使用率的备选方法（使用内置os模块）
   */
  private getFallbackMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return (totalMem - freeMem) / totalMem; // 转换为0-1之间的小数
  }

  /**
   * 获取磁盘使用率
   */
  private async getDiskUsage(): Promise<number> {
    try {
      const fsSize = await si.fsSize();
      
      // 获取主磁盘（通常是第一个，或者是C盘）
      const mainDisk = process.platform === 'win32'
        ? fsSize.find(disk => disk.mount === 'C:') || fsSize[0]
        : fsSize.find(disk => disk.mount === '/') || fsSize[0];
      
      if (mainDisk) {
        return mainDisk.use / 100; // 转换为0-1之间的小数
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get disk usage:', error);
      return 0;
    }
  }

  /**
   * 获取系统信息
   */
  private async getSystemInfo() {
    try {
      const [system, cpu, mem, osInfo, networkInterfacesInfo, disk] = await Promise.all([
        si.system(),
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.networkInterfaces(),
        si.fsSize()
      ]);
      
      // 确保networkInterfaces是数组
      const networkInterfaces = Array.isArray(networkInterfacesInfo) 
        ? networkInterfacesInfo 
        : [networkInterfacesInfo].filter(Boolean);
        
      // 计算总磁盘空间和剩余空间
      const totalDiskSpace = disk.reduce((total, item) => total + item.size, 0);
      const freeDiskSpace = disk.reduce((total, item) => total + (item.size - (item.size * (item.use / 100))), 0);
      
      return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: osInfo.release || os.release(),
        totalMemory: mem.total,
        freeMemory: mem.free,
        usedMemory: mem.used,
        cpuModel: cpu.manufacturer + ' ' + cpu.brand,
        cpus: cpu.cores,
        loadavg: os.loadavg(),
        networkInterfaces: this.formatNetworkInfo(networkInterfaces),
        systemModel: system.manufacturer + ' ' + system.model,
        diskSize: totalDiskSpace,
        diskFree: freeDiskSpace,
        diskUsed: totalDiskSpace - freeDiskSpace
      };
    } catch (error) {
      console.error('Failed to get system info:', error);
      // 使用备选方法
      return this.getFallbackSystemInfo();
    }
  }

  /**
   * 获取系统信息的备选方法（使用内置os模块）
   */
  private getFallbackSystemInfo() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      totalMemory: totalMemory,
      freeMemory: freeMemory,
      usedMemory: totalMemory - freeMemory,
      cpus: os.cpus().length,
      loadavg: os.loadavg(),
      networkInterfaces: this.getNetworkInfo(),
    };
  }

  /**
   * 格式化网络接口信息
   */
  private formatNetworkInfo(interfaces: si.Systeminformation.NetworkInterfacesData[]) {
    const result = {};
    
    interfaces.forEach(iface => {
      if (!iface.internal) {
        if (!result[iface.iface]) {
          result[iface.iface] = [];
        }
        
        result[iface.iface].push({
          address: iface.ip4 || iface.ip6,
          family: iface.ip4 ? 'IPv4' : 'IPv6',
          mac: iface.mac,
          speed: iface.speed,
          type: iface.type,
          operstate: iface.operstate
        });
      }
    });
    
    return result;
  }

  /**
   * 获取网络接口信息（使用内置os模块）
   */
  private getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const result = {};
    
    for (const name in interfaces) {
      result[name] = interfaces[name]
        .filter(iface => !iface.internal)
        .map(iface => ({
          address: iface.address,
          family: iface.family,
          mac: iface.mac,
        }));
    }
    
    return result;
  }
}