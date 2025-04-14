import { IsString, IsOptional, IsInt, Min, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 创建字典DTO
 * 定义创建字典需要的参数
 */
export class CreateDictionaryDto {
  /**
   * 字典编码，唯一标识
   */
  @IsString({ message: '字典编码必须是字符串' })
  @IsNotEmpty({ message: '字典编码不能为空' })
  @MaxLength(100, { message: '字典编码长度不能超过100' })
  code: string;

  /**
   * 字典名称
   */
  @IsString({ message: '字典名称必须是字符串' })
  @IsNotEmpty({ message: '字典名称不能为空' })
  @MaxLength(100, { message: '字典名称长度不能超过100' })
  name: string;

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
  @Transform(({ value }) => (value ? Number(value) : 0))
  sort?: number = 0;

  /**
   * 字典状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;

  /**
   * 是否为系统字典，默认为否
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统标识必须是有效的枚举值' })
  isSystem?: string = IsSystemEnum.NO;
}
