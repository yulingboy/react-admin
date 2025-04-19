/**
 * 简化版存储工具，仅封装通用localStorage与sessionStorage操作
 */

// 存储键名常量
export const STORAGE_KEYS = {
  TOKEN: 'token', // 与旧的TOKEN_KEY保持一致
  USER_INFO: 'userInfo' // 与旧的存储键名保持一致
};

/**
 * localStorage操作
 */
export const local = {
  /**
   * 设置localStorage项
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage set error:', error);
    }
  },

  /**
   * 获取localStorage项
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue ?? null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('localStorage get error:', error);
      return defaultValue ?? null;
    }
  },

  /**
   * 移除localStorage项
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * 清空localStorage
   */
  clear: (): void => {
    localStorage.clear();
  },

  /**
   * 清空带指定前缀的localStorage项
   */
  clearWithPrefix: (prefix: string): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * sessionStorage操作
 */
export const session = {
  /**
   * 设置sessionStorage项
   */
  set: <T>(key: string, value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('sessionStorage set error:', error);
    }
  },

  /**
   * 获取sessionStorage项
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const value = sessionStorage.getItem(key);
      if (value === null) return defaultValue ?? null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('sessionStorage get error:', error);
      return defaultValue ?? null;
    }
  },

  /**
   * 移除sessionStorage项
   */
  remove: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  /**
   * 清空sessionStorage
   */
  clear: (): void => {
    sessionStorage.clear();
  },

  /**
   * 清空带指定前缀的sessionStorage项
   */
  clearWithPrefix: (prefix: string): void => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export default {
  local,
  session,
  STORAGE_KEYS
};
