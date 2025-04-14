import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCodeGeneratorColumnDto {
  @IsNumber()
  @IsNotEmpty({ message: '列ID不能为空' })
  id: number;

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
