import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

/**
 * 批量删除账单标签DTO
 */
export class BatchDeleteDto {
  /**
   * 要删除的账单标签ID数组
   */
  @IsArray({ message: 'ids必须是数组' })
  @ArrayMinSize(1, { message: 'ids至少包含一项' })
  @IsInt({ each: true, message: '每一项必须是整数' })
  ids: number[];
}