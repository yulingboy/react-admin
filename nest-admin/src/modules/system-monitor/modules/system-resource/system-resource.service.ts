import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { SystemResourcesQueryDto } from '../../dto/system-monitor.dto';
import * as os from 'os';
import * as si from 'systeminformation';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SystemResourceService implements OnModuleInit {
  // 添加缓存变量
  private cachedSystemInfo: any = null;
  private cachedCpuUsage: number = 0;
  private cachedMemUsage: number = 0;
  private cachedDiskUsage: number = 0;
  private lastRefreshTime: Date = new Date(0);
  private cacheValidityPeriod: number = 30 * 1000; // 30秒缓存有效期

  constructor(private prisma: PrismaService) {}

  // 模块初始化时预加载数据
  async onModuleInit() {
    await this.refreshCachedData();
    console.log('系统资源监控服务已初始化，预加载了系统信息');
  }

  /**
   * 获取实时系统资源使用情况
   */
  async getSystemResourcesRealtime() {
    // 检查缓存是否过期
    const now = new Date();
    if (now.getTime() - this.lastRefreshTime.getTime() > this.cacheValidityPeriod) {
      // 如果过期了，异步更新缓存，但不阻塞当前请求
      this.refreshCachedData().catch(err => 
        console.error('刷新系统资源缓存数据失败:', err)
      );
    }

    return {
      cpuUsage: this.cachedCpuUsage,
      memUsage: this.cachedMemUsage,
      diskUsage: this.cachedDiskUsage,
      uptime: os.uptime(),
      systemInfo: this.cachedSystemInfo,
      timestamp: new Date(),
      cachedAt: this.lastRefreshTime,
    };
  }

  /**
   * 更新缓存数据的方法
   * 集中处理所有耗时的系统调用
   */
  private async refreshCachedData() {
    try {
      // 并行执行所有系统信息查询
      const [cpuData, memData, diskData, systemInfoData] = await Promise.all([
        this.fetchCpuUsage(),
        this.fetchMemoryUsage(),
        this.fetchDiskUsage(),
        this.fetchSystemInfo()
      ]);

      // 更新缓存
      this.cachedCpuUsage = cpuData;
      this.cachedMemUsage = memData;
      this.cachedDiskUsage = diskData;
      this.cachedSystemInfo = systemInfoData;
      this.lastRefreshTime = new Date();

      return true;
    } catch (error) {
      console.error('更新系统资源缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取系统资源概览数据
   * 包含实时数据和历史趋势
   */
  async getSystemResourcesOverview() {
    // 获取实时数据 - 直接使用缓存
    const realtimeData = await this.getSystemResourcesRealtime();
    
    // 获取最近24小时的资源使用趋势
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const trends = await this.prisma.systemResource.findMany({
      where: {
        timestamp: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        cpuUsage: true,
        memUsage: true,
        diskUsage: true,
        uptime: true,
        timestamp: true,
      },
    });

    // 计算CPU、内存、磁盘使用率的24小时平均值
    let avgCpuUsage = 0;
    let avgMemUsage = 0;
    let avgDiskUsage = 0;
    
    if (trends.length > 0) {
      avgCpuUsage = trends.reduce((sum, item) => sum + item.cpuUsage, 0) / trends.length;
      avgMemUsage = trends.reduce((sum, item) => sum + item.memUsage, 0) / trends.length;
      avgDiskUsage = trends.reduce((sum, item) => sum + item.diskUsage, 0) / trends.length;
    }

    // 格式化趋势数据为前端需要的格式
    const formattedTrends = trends.map(item => ({
      cpuUsage: item.cpuUsage,
      memUsage: item.memUsage,
      diskUsage: item.diskUsage,
      uptime: item.uptime,
      timestamp: item.timestamp.toISOString(),
    }));

    // 返回组合数据
    return {
      ...realtimeData,
      trends: formattedTrends,
      stats: {
        avgCpuUsage,
        avgMemUsage,
        avgDiskUsage,
        samplesCount: trends.length,
        period: '24h',
      },
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
   * 同时也更新缓存
   */
  @Cron('0 */5 * * * *')
  async collectSystemResources() {
    try {
      // 先更新缓存
      await this.refreshCachedData();
      
      // 然后保存到数据库
      await this.prisma.systemResource.create({
        data: {
          cpuUsage: this.cachedCpuUsage,
          memUsage: this.cachedMemUsage,
          diskUsage: this.cachedDiskUsage,
          uptime: os.uptime(),
        },
      });
      
      console.log(`[${new Date().toISOString()}] 系统资源监控数据已收集`);
    } catch (error) {
      console.error('收集系统资源监控数据失败:', error);
    }
  }

  /**
   * 每30秒自动刷新缓存数据
   */
  @Cron('*/30 * * * * *')
  async refreshCacheJob() {
    await this.refreshCachedData();
    console.log(`[${new Date().toISOString()}] 系统资源缓存已更新`);
  }

  /**
   * 获取CPU使用率
   */
  private async fetchCpuUsage(): Promise<number> {
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
  private async fetchMemoryUsage(): Promise<number> {
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
  private async fetchDiskUsage(): Promise<number> {
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
  private async fetchSystemInfo() {
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