import { IsString, IsOptional, IsEnum, MinLength, MaxLength, Length } from 'class-validator';
import { StatusEnum } from 'src/common/enums/common.enum';

/**
 * 创建角色DTO
 * 定义创建角色需要的参数
 */
export class CreateRoleDto {
  /**
   * 角色唯一标识
   */
  @IsString({ message: '角色标识必须是字符串' })
  @Length(2, 50, { message: '角色标识长度必须在2到50之间' })
  key: string;

  /**
   * 角色名称，唯一标识
   */
  @IsString({ message: '角色名必须是字符串' })
  @Length(2, 50, { message: '角色名长度必须在2到50之间' })
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
}
