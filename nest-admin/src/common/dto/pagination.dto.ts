import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
  /* 当前页 */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public current?: number = 1;

  /* 每页条数 */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  public pageSize?: number = 10;

  /* 排序字段 */
  @IsOptional()
  @IsString()
  public orderByColumn?: string = 'id';

  /* 排序方式 */
  @IsOptional()
  @IsString()
  public isAsc?: string = 'ASC';

  /* mysql忽略条数 */
  get skip(): number {
    return (this.current! - 1) * this.pageSize!;
  }

  /* mysql返回条数 */
  get take(): number {
    return this.pageSize!;
  }
}    