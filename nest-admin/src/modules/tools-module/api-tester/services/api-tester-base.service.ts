import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { AxiosResponse } from 'axios';

/**
 * API测试基础服务
 * 提供API测试的通用功能和工具方法
 */
@Injectable()
export class ApiTesterBaseService {
  constructor(
    protected prisma: PrismaService
  ) {}

  /**
   * 计算响应大小（字节）
   * @param response Axios响应对象
   * @returns 响应总大小（字节）
   */
  protected calculateResponseSize(response: AxiosResponse): number {
    // 计算头部大小
    const headersSize = Object.entries(response.headers).reduce((size, [key, value]) => {
      return size + key.length + (typeof value === 'string' ? value.length : String(value).length);
    }, 0);

    // 计算主体大小
    let bodySize = 0;
    if (response.data) {
      if (typeof response.data === 'string') {
        bodySize = response.data.length;
      } else {
        try {
          bodySize = JSON.stringify(response.data).length;
        } catch (e) {
          // 如果无法序列化，估计大小
          bodySize = 100;
        }
      }
    }

    return headersSize + bodySize;
  }
}