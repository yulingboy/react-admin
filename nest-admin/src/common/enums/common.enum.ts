/**
 * 通用状态枚举
 * 用于表示记录的启用/禁用状态
 */
export enum StatusEnum {
  /** 禁用 */
  DISABLED = '0',
  /** 启用 */
  ENABLED = '1',
}

/**
 * 系统数据枚举
 * 用于表示记录是否为系统预设数据
 */
export enum IsSystemEnum {
  /** 非系统数据，可删除 */
  NO = '0',
  /** 系统数据，不可删除 */
  YES = '1',
}
