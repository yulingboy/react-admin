import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum } from 'class-validator';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 更新账单标签DTO
 * 定义更新账单标签需要的参数
 */
export class UpdateBillTagDto {
  /**
   * 标签ID
   */
  @IsInt({ message: '标签ID必须是整数' })
  @Min(1, { message: '标签ID必须大于0' })
  @Max(999999, { message: '标签ID不能大于999999' })
  id: number;

  /**
   * 标签名称
   */
  @IsOptional()
  @IsString({ message: '标签名称必须是字符串' })
  @MinLength(1, { message: '标签名称长度不能小于1' })
  @MaxLength(50, { message: '标签名称长度不能大于50' })
  name?: string;

  /**
   * 标签颜色
   */
  @IsOptional()
  @IsString({ message: '颜色必须是字符串' })
  @MaxLength(20, { message: '颜色长度不能大于20' })
  color?: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(200, { message: '描述长度不能大于200' })
  description?: string;

  /**
   * 状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 排序
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number;
}