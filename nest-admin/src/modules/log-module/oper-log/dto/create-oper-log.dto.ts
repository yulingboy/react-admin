import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

/**
 * 创建操作日志DTO
 */
export class CreateOperLogDto {
  @IsNotEmpty()
  @IsString()
  title: string; // 操作模块

  @IsOptional()
  @IsString()
  businessType?: string = '0'; // 业务类型（0其它 1新增 2修改 3删除）

  @IsOptional()
  @IsString()
  method?: string; // 请求方法

  @IsOptional()
  @IsString()
  requestMethod?: string; // HTTP请求方法

  @IsOptional()
  @IsString()
  operatorType?: string = '0'; // 操作类别（0其它 1后台用户 2手机端用户）

  @IsOptional()
  @IsString()
  operName?: string; // 操作人员

  @IsOptional()
  @IsString()
  operUrl?: string; // 请求URL

  @IsOptional()
  @IsString()
  operIp?: string; // 主机地址

  @IsOptional()
  @IsString()
  operLocation?: string; // 操作地点

  @IsOptional()
  @IsString()
  operParam?: string; // 请求参数

  @IsOptional()
  @IsString()
  jsonResult?: string; // 返回参数

  @IsOptional()
  @IsString()
  status?: string = '0'; // 操作状态（0正常 1异常）

  @IsOptional()
  @IsString()
  errorMsg?: string; // 错误消息

  @IsOptional()
  @IsInt()
  userId?: number; // 用户ID
}