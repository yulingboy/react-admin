import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * 创建通知DTO
 * 定义创建通知需要的参数
 */
export class CreateNotificationDto {
  /**
   * 通知标题
   */
  @IsNotEmpty({ message: '通知标题不能为空' })
  @IsString({ message: '通知标题必须是字符串' })
  title: string;

  /**
   * 通知内容
   */
  @IsNotEmpty({ message: '通知内容不能为空' })
  @IsString({ message: '通知内容必须是字符串' })
  content: string;

  /**
   * 通知类型
   */
  @IsNotEmpty({ message: '通知类型不能为空' })
  @IsString({ message: '通知类型必须是字符串' })
  type: string;
}