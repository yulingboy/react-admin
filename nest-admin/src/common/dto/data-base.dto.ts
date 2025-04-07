import { IsOptional, IsString } from 'class-validator';

export class DataBaseDto {
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: Date | string;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: Date | string;
  /** 备注 */
  @IsOptional()
  @IsString()
  remark?: string;
}
