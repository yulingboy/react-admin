import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 更新角色DTO
 * 定义更新角色需要的参数，所有字段都是可选的
 */
export class UpdateRoleDto {
  /**
   * 角色ID
   */
  @IsInt({ message: '角色ID必须是整数' })
  @Min(1, { message: '角色ID必须大于0' })
  @Max(999999, { message: '角色ID不能大于999999' })
  id: number;

  /**
   * 角色唯一标识
   */
  @IsOptional()
  @IsString({ message: '角色标识必须是字符串' })
  @MinLength(2, { message: '角色标识长度不能小于2' })
  @MaxLength(50, { message: '角色标识长度不能大于50' })
  key?: string;

  /**
   * 角色名称
   */
  @IsOptional()
  @IsString({ message: '角色名必须是字符串' })
  @MinLength(2, { message: '角色名长度不能小于2' })
  @MaxLength(50, { message: '角色名长度不能大于50' })
  name?: string;

  /**
   * 角色描述
   */
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(200, { message: '角色描述长度不能大于200' })
  description?: string;

  /**
   * 角色状态
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string;

  /**
   * 是否系统内置角色
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统内置角色值必须是有效的枚举值' })
  isSystem?: string;
}
