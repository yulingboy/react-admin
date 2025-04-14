import { IsArray, IsNumber } from 'class-validator';

export class BatchDeleteDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
