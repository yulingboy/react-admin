import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { StatusEnum, IsSystemEnum } from 'src/common/enums/common.enum';

/**
 * 创建角色DTO
 * 定义创建角色需要的参数
 */
export class CreateRoleDto {
  /**
   * 角色唯一标识
   */
  @IsString({ message: '角色标识必须是字符串' })
  @MinLength(2, { message: '角色标识长度不能小于2' })
  @MaxLength(50, { message: '角色标识长度不能大于50' })
  key: string;

  /**
   * 角色名称，唯一标识
   */
  @IsString({ message: '角色名必须是字符串' })
  @MinLength(2, { message: '角色名长度不能小于2' })
  @MaxLength(50, { message: '角色名长度不能大于50' })
  name: string;

  /**
   * 角色描述
   */
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(200, { message: '角色描述长度不能大于200' })
  description?: string;

  /**
   * 角色状态，默认为启用
   */
  @IsOptional()
  @IsEnum(StatusEnum, { message: '状态值必须是有效的枚举值' })
  status?: string = StatusEnum.ENABLED;
  
  /**
   * 是否系统内置角色，默认为否
   */
  @IsOptional()
  @IsEnum(IsSystemEnum, { message: '系统内置角色值必须是有效的枚举值' })
  isSystem?: string = IsSystemEnum.NO;
}
