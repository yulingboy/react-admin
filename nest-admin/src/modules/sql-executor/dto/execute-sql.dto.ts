import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 执行SQL的DTO
 */
export class ExecuteSqlDto {
  /**
   * SQL语句
   */
  @IsString()
  @IsNotEmpty({ message: 'SQL语句不能为空' })
  sql: string;
}