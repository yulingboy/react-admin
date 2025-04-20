import { IsString, IsOptional, IsInt, Min, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 更新字典DTO
 * 定义更新字典需要的参数
 */
export class UpdateDictionaryDto {
  /**
   * 字典ID
   */
  @IsInt({ message: '字典ID必须是整数' })
  @Min(1, { message: '字典ID必须大于0' })
  @IsNotEmpty({ message: '字典ID不能为空' })
  @Transform(({ value }) => Number(value))
  id: number;

  /**
   * 字典编码
   */
  @IsOptional()
  @IsString({ message: '字典编码必须是字符串' })
  @MaxLength(100, { message: '字典编码长度不能超过100' })
  code?: string;

  /**
   * 字典名称
   */
  @IsOptional()
  @IsString({ message: '字典名称必须是字符串' })
  @MaxLength(100, { message: '字典名称长度不能超过100' })
  name?: string;

  /**
   * 字典描述
   */
  @IsOptional()
  @IsString({ message: '字典描述必须是字符串' })
  @MaxLength(200, { message: '字典描述长度不能超过200' })
  description?: string;

  /**
   * 字典排序
   */
  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  @Min(0, { message: '排序值不能小于0' })
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  sort?: number;

  /**
   * 字典状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 是否为系统字典
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统标识必须是有效的枚举值' })
  isSystem?: string;
}
