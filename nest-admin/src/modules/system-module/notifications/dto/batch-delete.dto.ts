import { IsArray, ArrayMinSize, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 批量删除通知DTO
 */
export class BatchDeleteDto {
  /**
   * 需要删除的通知ID数组
   */
  @IsArray({ message: 'ids必须是数组' })
  @ArrayMinSize(1, { message: '至少需要一个通知ID' })
  @IsInt({ each: true, message: '每个ID必须是整数' })
  @Transform(({ value }) => 
    Array.isArray(value) ? value.map(id => Number(id)) : [Number(value)]
  )
  ids: number[];
}