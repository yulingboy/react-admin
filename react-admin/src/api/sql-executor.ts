import { request as http } from '@/utils/http';

/**
 * 执行SQL语句
 * @param sql SQL语句
 */
export function executeSql(sql: string) {
  return http.post<any>('/api/sql-executor/execute', { sql });
}