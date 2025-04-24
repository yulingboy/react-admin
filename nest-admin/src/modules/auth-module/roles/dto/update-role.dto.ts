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
  id: number;

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
  
}
