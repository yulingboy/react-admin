import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImportTableColumnsDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  generatorId: number;

  @IsString()
  @IsNotEmpty({ message: '表名不能为空' })
  tableName: string;
}
