import { Injectable, Logger } from '@nestjs/common';
import { LoginLogService } from '../../log-module/login-log/login-log.service';
import { CreateLoginLogDto } from '../../log-module/login-log/dto';
import { Request } from 'express';

/**
 * 登录日志记录服务
 * 用于记录用户登录相关的日志
 */
@Injectable()
export class LoginLogRecordService {
  private readonly logger = new Logger(LoginLogRecordService.name);

  constructor(private readonly loginLogService: LoginLogService) {}

  /**
   * 记录登录成功日志
   * @param userId 用户ID
   * @param username 用户名
   * @param request 请求对象
   * @param message 登录消息
   */
  async recordLoginSuccess(userId: number, username: string, request: Request, message?: string) {
    try {
      const loginLog: CreateLoginLogDto = {
        userId,
        username,
        ipAddress: this.getClientIp(request),
        loginLocation: await this.getIpLocation(this.getClientIp(request)),
        browser: this.getBrowser(request),
        os: this.getOS(request),
        status: '1', // 登录成功
        msg: message || '登录成功'
      };
      this.logger.log(`记录登录成功日志: ${JSON.stringify(loginLog)}`);
      await this.loginLogService.create(loginLog);
    } catch (error) {
      this.logger.error(`记录登录成功日志失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 记录登录失败日志
   * @param username 用户名
   * @param request 请求对象
   * @param message 失败消息
   */
  async recordLoginFailure(username: string, request: Request, message: string) {
    try {
      const loginLog: CreateLoginLogDto = {
        username,
        ipAddress: this.getClientIp(request),
        loginLocation: await this.getIpLocation(this.getClientIp(request)),
        browser: this.getBrowser(request),
        os: this.getOS(request),
        status: '0', // 登录失败
        msg: message
      };

      await this.loginLogService.create(loginLog);
    } catch (error) {
      this.logger.error(`记录登录失败日志失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 获取客户端IP地址
   * @param request 请求对象
   */
  private getClientIp(request: Request): string {
    const ip = request.headers['x-forwarded-for'] || 
               request.connection.remoteAddress ||
               request.socket.remoteAddress;
    
    // 如果是本地地址，返回127.0.0.1
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    
    // 如果x-forwarded-for是逗号分隔的多个IP，取第一个
    if (typeof ip === 'string' && ip.includes(',')) {
      return ip.split(',')[0].trim();
    }
    
    return ip as string;
  }

  /**
   * 获取IP地址所在位置信息
   * @param ip IP地址
   */
  private async getIpLocation(ip: string): Promise<string> {
    // 这里可以调用IP地理位置服务API获取位置信息
    // 实际应用中，可以使用第三方API或者本地IP库
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return '内网IP';
    }
    
    try {
      // 实际项目中这里可以接入第三方IP查询服务
      // 例如：https://ip-api.com, ipify, ipinfo.io等
      // 这里暂时返回默认值
      return '未知位置';
    } catch (error) {
      this.logger.error(`获取IP位置信息失败: ${error.message}`, error.stack);
      return '未知位置';
    }
  }

  /**
   * 获取浏览器信息
   * @param request 请求对象
   */
  private getBrowser(request: Request): string {
    const userAgent = request.headers['user-agent'] || '';
    
    if (userAgent.includes('Edge')) {
      return 'Microsoft Edge';
    } else if (userAgent.includes('Firefox')) {
      return 'Mozilla Firefox';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
      return 'Google Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Apple Safari';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'Internet Explorer';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    } else {
      return '未知浏览器';
    }
  }

  /**
   * 获取操作系统信息
   * @param request 请求对象
   */
  private getOS(request: Request): string {
    const userAgent = request.headers['user-agent'] || '';
    
    if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      return 'Mac OS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    } else {
      return '未知操作系统';
    }
  }
}