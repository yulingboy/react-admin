import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCodeGeneratorDto {
  @IsNumber()
  @IsNotEmpty({ message: 'ID不能为空' })
  id: number;

  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: '表名称不能为空' })
  tableName: string;

  @IsString()
  @IsNotEmpty({ message: '模块名称不能为空' })
  moduleName: string;

  @IsString()
  @IsNotEmpty({ message: '业务名称不能为空' })
  businessName: string;

  @IsString()
  @IsOptional()
  options?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
