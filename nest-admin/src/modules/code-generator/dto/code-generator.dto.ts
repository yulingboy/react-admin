import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryType } from '../interfaces/code-generator.interface';

export class CreateCodeGeneratorDto {
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
  @IsNotEmpty({ message: '包名称不能为空' })
  packageName: string;

  @IsString()
  @IsNotEmpty({ message: '功能名称不能为空' })
  functionName: string;

  @IsString()
  @IsNotEmpty({ message: '功能作者不能为空' })
  functionAuthor: string;

  @IsString()
  @IsOptional()
  tablePrefix?: string;

  @IsString()
  @IsOptional()
  options?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class CreateCodeGeneratorColumnDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  generatorId: number;

  @IsString()
  @IsNotEmpty({ message: '列名不能为空' })
  columnName: string;

  @IsString()
  @IsOptional()
  columnComment?: string;

  @IsString()
  @IsNotEmpty({ message: '列类型不能为空' })
  columnType: string;

  @IsString()
  @IsNotEmpty({ message: 'TypeScript类型不能为空' })
  tsType: string;

  @IsBoolean()
  @IsOptional()
  isPk?: boolean;

  @IsBoolean()
  @IsOptional()
  isIncrement?: boolean;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isInsert?: boolean;

  @IsBoolean()
  @IsOptional()
  isEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  isList?: boolean;

  @IsBoolean()
  @IsOptional()
  isQuery?: boolean;

  @IsString()
  @IsOptional()
  queryType?: string;

  @IsString()
  @IsOptional()
  htmlType?: string;

  @IsString()
  @IsOptional()
  dictType?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;
}

export class UpdateCodeGeneratorDto extends CreateCodeGeneratorDto {}

export class UpdateCodeGeneratorColumnDto extends CreateCodeGeneratorColumnDto {
  @IsNumber()
  @IsNotEmpty({ message: '列ID不能为空' })
  id: number;
}

export class GenerateCodeDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  id: number;
}

export class ImportTableColumnsDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  generatorId: number;

  @IsString()
  @IsNotEmpty({ message: '表名不能为空' })
  tableName: string;
}

export class SyncColumnsDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  id: number;
}

export class CodePreviewDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  id: number;
}