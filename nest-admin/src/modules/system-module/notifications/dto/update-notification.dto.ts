import { IsString, IsOptional, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 更新通知DTO
 * 定义更新通知需要的参数
 */
export class UpdateNotificationDto {
  /**
   * 通知ID
   */
  @IsInt({ message: '通知ID必须是整数' })
  @Min(1, { message: '通知ID必须大于0' })
  @Transform(({ value }) => Number(value))
  id: number;

  /**
   * 通知标题
   */
  @IsOptional()
  @IsString({ message: '通知标题必须是字符串' })
  title?: string;

  /**
   * 通知内容
   */
  @IsOptional()
  @IsString({ message: '通知内容必须是字符串' })
  content?: string;

  /**
   * 通知类型
   */
  @IsOptional()
  @IsString({ message: '通知类型必须是字符串' })
  type?: string;
}