import { IsNotEmpty, IsNumber } from 'class-validator';

export class SyncColumnsDto {
  @IsNumber()
  @IsNotEmpty({ message: '生成器ID不能为空' })
  id: number;
}
