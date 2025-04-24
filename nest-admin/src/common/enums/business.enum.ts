/**
 * 性别枚举
 */
export enum GenderEnum {
  /** 未知 */
  UNKNOWN = '0',
  /** 男 */
  MALE = '1',
  /** 女 */
  FEMALE = '2',
}

/**
 * 用户状态枚举
 */
export enum UserStatusEnum {
  /** 禁用 */
  DISABLED = '0',
  /** 正常 */
  NORMAL = '1',
  /** 锁定 */
  LOCKED = '2',
}

/**
 * 操作类型枚举
 */
export enum OperateTypeEnum {
  /** 其他 */
  OTHER = '0',
  /** 新增 */
  CREATE = '1',
  /** 修改 */
  UPDATE = '2',
  /** 删除 */
  DELETE = '3',
  /** 授权 */
  GRANT = '4',
  /** 导出 */
  EXPORT = '5',
  /** 导入 */
  IMPORT = '6',
  /** 强制退出 */
  FORCE_QUIT = '7',
  /** 清空数据 */
  CLEAN = '8',
}

/**
 * 是否枚举
 */
export enum YesNoEnum {
  /** 否 */
  NO = '0',
  /** 是 */
  YES = '1',
}

/**
 * 文件存储位置枚举
 */
export enum FileStorageEnum {
  /** 本地存储 */
  LOCAL = '0',
  /** 阿里云 */
  ALIYUN = '1',
  /** 腾讯云 */
  TENCENT = '2',
  /** 七牛云 */
  QINIU = '3',
  /** MinIO */
  MINIO = '4',
}

/**
 * 任务状态枚举
 */
export enum JobStatusEnum {
  /** 暂停 */
  PAUSE = '0',
  /** 正常 */
  NORMAL = '1',
}

/**
 * 通知公告状态枚举
 */
export enum NoticeStatusEnum {
  /** 草稿 */
  DRAFT = '0',
  /** 发布 */
  PUBLISHED = '1',
}

/**
 * 通知公告类型枚举
 */
export enum NoticeTypeEnum {
  /** 通知 */
  NOTICE = '1',
  /** 公告 */
  ANNOUNCEMENT = '2',
}

/**
 * 登录状态枚举
 */
export enum LoginStatusEnum {
  /** 成功 */
  SUCCESS = '0',
  /** 失败 */
  FAIL = '1',
}