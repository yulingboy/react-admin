import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

/**
 * 批量删除配置DTO
 */
export class BatchDeleteConfigDto {
  /**
   * 要删除的配置ID数组
   */
  @IsArray({ message: '必须提供配置ID数组' })
  @IsInt({ each: true, message: '每个ID必须是整数' })
  @ArrayMinSize(1, { message: '至少提供一个配置ID' })
  ids: number[];
}
