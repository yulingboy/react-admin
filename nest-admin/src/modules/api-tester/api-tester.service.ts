import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiTestRequestDto, 
  ApiTestHistoryQueryDto, 
  ApiTestTemplateCreateDto 
} from './dto/api-tester.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ApiTesterService {
  constructor(
    private prisma: PrismaService,
  ) {}

  /**
   * 发送API测试请求
   * @param data API测试请求参数
   * @param userId 当前用户ID
   */
  async testApi(data: ApiTestRequestDto, userId?: number): Promise<any> {
    const startTime = Date.now();
    try {
      // 构建URL
      let url = data.url;
      let queryString = '';
      
      // 处理启用的参数
      if (data.params && data.params.length > 0) {
        const enabledParams = data.params.filter(param => param.enabled);
        if (enabledParams.length > 0) {
          queryString = enabledParams
            .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
            .join('&');
          
          // 如果URL已经包含查询参数，则添加&，否则添加?
          url = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
        }
      }

      // 构建请求配置
      const config: AxiosRequestConfig = {
        method: data.method,
        url,
        timeout: data.timeout || 10000,
        headers: data.headers
          .filter(header => header.enabled)
          .reduce((acc, header) => ({ ...acc, [header.key]: header.value }), {}),
      };

      // 处理请求体
      if (data.method !== 'GET' && data.method !== 'HEAD' && data.body) {
        if (data.contentType === 'application/json') {
          config.data = data.body;
        } else if (data.contentType === 'application/x-www-form-urlencoded') {
          // 转换为URLSearchParams
          const formData = new URLSearchParams();
          Object.entries(data.body).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          config.data = formData;
          config.headers = { ...config.headers, 'Content-Type': data.contentType };
        } else {
          // 其他内容类型直接传递
          config.data = data.body;
          config.headers = { ...config.headers, 'Content-Type': data.contentType };
        }
      }

      // 发送请求
      const response: AxiosResponse = await axios(config);
      const endTime = Date.now();
      
      // 计算响应大小
      const responseSize = this.calculateResponseSize(response);
      
      // 格式化响应
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        time: endTime - startTime,
        size: responseSize
      };

      // 如果需要保存到历史记录
      if (data.saveToHistory !== false && userId) {
        await this.prisma.apiTestHistory.create({
          data: {
            name: data.name || '未命名请求',
            url: data.url,
            method: data.method,
            request: data as any,
            response: result,
            userId
          }
        });
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      
      // 格式化错误响应
      const errorResponse = {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || error.message,
        headers: error.response?.headers || {},
        data: error.response?.data || { message: error.message },
        time: endTime - startTime,
        size: 0,
        error: true
      };

      // 如果需要保存到历史记录
      if (data.saveToHistory !== false && userId) {
        await this.prisma.apiTestHistory.create({
          data: {
            name: data.name || '未命名请求(失败)',
            url: data.url,
            method: data.method,
            request: data as any,
            response: errorResponse,
            userId
          }
        });
      }

      return errorResponse;
    }
  }

  /**
   * 获取API测试历史记录
   * @param query 查询参数
   * @param userId 当前用户ID
   */
  async getHistory(query: ApiTestHistoryQueryDto, userId: number) {
    const { page = 1, pageSize = 10, name, method, url, startTime, endTime } = query;
    const skip = (page - 1) * pageSize;

    // 构建过滤条件
    const where: any = { userId };

    if (name) {
      where.name = { contains: name };
    }

    if (method) {
      where.method = method;
    }

    if (url) {
      where.url = { contains: url };
    }

    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) {
        where.createdAt.gte = new Date(startTime);
      }
      if (endTime) {
        where.createdAt.lte = new Date(endTime);
      }
    }

    // 查询总数
    const total = await this.prisma.apiTestHistory.count({ where });

    // 查询列表
    const list = await this.prisma.apiTestHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return { total, list };
  }

  /**
   * 获取API测试历史记录详情
   * @param id 历史记录ID
   * @param userId 当前用户ID
   */
  async getHistoryDetail(id: number, userId: number) {
    const history = await this.prisma.apiTestHistory.findUnique({
      where: { id },
    });

    if (!history || (history.userId !== userId && userId !== 1)) {
      throw new HttpException('历史记录不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return history;
  }

  /**
   * 删除API测试历史记录
   * @param id 历史记录ID
   * @param userId 当前用户ID
   */
  async deleteHistory(id: number, userId: number) {
    const history = await this.prisma.apiTestHistory.findUnique({
      where: { id },
    });

    if (!history || (history.userId !== userId && userId !== 1)) {
      throw new HttpException('历史记录不存在或无权删除', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestHistory.delete({
      where: { id },
    });
  }

  /**
   * 批量删除API测试历史记录
   * @param ids 历史记录ID数组
   * @param userId 当前用户ID
   */
  async batchDeleteHistory(ids: number[], userId: number) {
    // 超级管理员可以删除所有记录，普通用户只能删除自己的记录
    if (userId === 1) {
      return this.prisma.apiTestHistory.deleteMany({
        where: { id: { in: ids } },
      });
    } else {
      return this.prisma.apiTestHistory.deleteMany({
        where: {
          id: { in: ids },
          userId,
        },
      });
    }
  }

  /**
   * 创建API测试模板
   * @param data 模板数据
   * @param userId 当前用户ID
   */
  async createTemplate(data: ApiTestTemplateCreateDto, userId: number) {
    return this.prisma.apiTestTemplate.create({
      data: {
        ...data,
        headers: data.headers as any,
        params: data.params as any,
        body: data.body as any,
        userId,
      },
    });
  }

  /**
   * 获取API测试模板列表
   * @param query 查询参数
   * @param userId 当前用户ID
   */
  async getTemplateList(query: { name?: string; page?: number; pageSize?: number }, userId: number) {
    const { page = 1, pageSize = 10, name } = query;
    const skip = (page - 1) * pageSize;

    // 构建过滤条件
    const where: any = { userId };

    if (name) {
      where.name = { contains: name };
    }

    // 查询总数
    const total = await this.prisma.apiTestTemplate.count({ where });

    // 查询列表
    const list = await this.prisma.apiTestTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    });

    return { total, list };
  }

  /**
   * 获取API测试模板详情
   * @param id 模板ID
   * @param userId 当前用户ID
   */
  async getTemplateDetail(id: number, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权访问', HttpStatus.NOT_FOUND);
    }

    return template;
  }

  /**
   * 更新API测试模板
   * @param id 模板ID
   * @param data 模板数据
   * @param userId 当前用户ID
   */
  async updateTemplate(id: number, data: ApiTestTemplateCreateDto, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权修改', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestTemplate.update({
      where: { id },
      data: {
        ...data,
        headers: data.headers as any,
        params: data.params as any,
        body: data.body as any,
      },
    });
  }

  /**
   * 删除API测试模板
   * @param id 模板ID
   * @param userId 当前用户ID
   */
  async deleteTemplate(id: number, userId: number) {
    const template = await this.prisma.apiTestTemplate.findUnique({
      where: { id },
    });

    if (!template || (template.userId !== userId && userId !== 1)) {
      throw new HttpException('模板不存在或无权删除', HttpStatus.NOT_FOUND);
    }

    return this.prisma.apiTestTemplate.delete({
      where: { id },
    });
  }

  /**
   * 计算响应大小（字节）
   * @param response Axios响应对象
   */
  private calculateResponseSize(response: AxiosResponse): number {
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