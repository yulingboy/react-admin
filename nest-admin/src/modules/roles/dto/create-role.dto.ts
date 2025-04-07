import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

/**
 * 创建角色DTO
 * 定义创建角色需要的参数
 */
export class CreateRoleDto {
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
   * 角色状态，默认为1（启用）
   */
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态值不能小于0' })
  @Max(10, { message: '状态值不能大于10' })
  status?: number = 1;
}
