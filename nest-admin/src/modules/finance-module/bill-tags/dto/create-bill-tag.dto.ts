import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 创建账单标签DTO
 * 定义创建账单标签需要的参数
 */
export class CreateBillTagDto {
  /**
   * 标签名称
   */
  @IsString({ message: '标签名称必须是字符串' })
  @MinLength(1, { message: '标签名称长度不能小于1' })
  @MaxLength(50, { message: '标签名称长度不能大于50' })
  name: string;

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
   * this is not from user,
   * is set by server
   */
  userId?: number;

  /**
   * 状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;

  /**
   * 排序，默认为0
   */
  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序不能小于0' })
  @Max(999, { message: '排序不能大于999' })
  sort?: number = 0;
}