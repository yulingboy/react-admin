import { IsArray } from 'class-validator';

/**
 * 批量删除DTO
 */
export class BatchDeleteDto {
  @IsArray()
  ids: number[]; // 需要删除的ID数组
}