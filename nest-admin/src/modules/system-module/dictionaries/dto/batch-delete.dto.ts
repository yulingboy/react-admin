import { IsArray, IsNotEmpty } from 'class-validator';

/**
 * 批量删除字典DTO
 */
export class BatchDeleteDto {
  /**
   * 字典ID数组
   */
  @IsArray({ message: 'ids必须是数组' })
  @IsNotEmpty({ message: 'ids不能为空' })
  ids: number[];
}
