import { IsString, IsOptional, IsInt, Min, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 创建字典项DTO
 * 定义创建字典项需要的参数
 */
export class CreateDictionaryItemDto {
  /**
   * 字典ID
   */
  @IsInt({ message: '字典ID必须是整数' })
  @Min(1, { message: '字典ID必须大于0' })
  @IsNotEmpty({ message: '字典ID不能为空' })
  @Transform(({ value }) => Number(value))
  dictionaryId: number;

  /**
   * 字典项编码
   */
  @IsString({ message: '字典项编码必须是字符串' })
  @IsNotEmpty({ message: '字典项编码不能为空' })
  @MaxLength(100, { message: '字典项编码长度不能超过100' })
  code: string;

  /**
   * 字典项值
   */
  @IsString({ message: '字典项值必须是字符串' })
  @IsNotEmpty({ message: '字典项值不能为空' })
  @MaxLength(100, { message: '字典项值长度不能超过100' })
  value: string;

  /**
   * 字典项标签
   */
  @IsString({ message: '字典项标签必须是字符串' })
  @IsNotEmpty({ message: '字典项标签不能为空' })
  @MaxLength(100, { message: '字典项标签长度不能超过100' })
  label: string;

  /**
   * 字典项颜色值
   */
  @IsOptional()
  @IsString({ message: '字典项颜色必须是字符串' })
  @MaxLength(20, { message: '字典项颜色长度不能超过20' })
  color?: string;

  /**
   * 附加数据（JSON格式）
   */
  @IsOptional()
  @IsString({ message: '附加数据必须是JSON字符串' })
  @MaxLength(500, { message: '附加数据长度不能超过500' })
  extra?: string;

  /**
   * 字典项排序
   */
  @IsOptional()
  @IsInt({ message: '排序值必须是整数' })
  @Min(0, { message: '排序值不能小于0' })
  @Transform(({ value }) => (value ? Number(value) : 0))
  sort?: number = 0;

  /**
   * 字典项状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;
}
