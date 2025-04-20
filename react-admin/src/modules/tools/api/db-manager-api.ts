import { request as http } from '@/utils/http';
import { DatabaseConnection, DatabaseConnectionListParams, DatabaseTable, DatabaseColumn, QueryResult } from '@/modules/tools/types/db-manager';

/**
 * 获取数据库连接列表
 * @param params 查询参数
 */
export function getDatabaseConnectionList(params: DatabaseConnectionListParams) {
  return http.get<{ total: number; list: DatabaseConnection[] }>('/api/db-manager/connections', { params });
}

/**
 * 获取数据库连接详情
 * @param id 连接ID
 */
export function getDatabaseConnectionDetail(id: number) {
  return http.get<DatabaseConnection>(`/api/db-manager/connections/${id}`);
}

/**
 * 测试数据库连接
 * @param data 连接数据
 */
export function testDatabaseConnection(data: Partial<DatabaseConnection>) {
  return http.post<{ success: boolean; message: string }>('/api/db-manager/connections/test', data);
}

/**
 * 创建数据库连接
 * @param data 连接数据
 */
export function createDatabaseConnection(data: Partial<DatabaseConnection>) {
  return http.post<DatabaseConnection>('/api/db-manager/connections', data);
}

/**
 * 更新数据库连接
 * @param id 连接ID
 * @param data 连接数据
 */
export function updateDatabaseConnection(id: number, data: Partial<DatabaseConnection>) {
  return http.put<DatabaseConnection>(`/api/db-manager/connections/${id}`, data);
}

/**
 * 删除数据库连接
 * @param id 连接ID
 */
export function deleteDatabaseConnection(id: number) {
  return http.delete<void>(`/api/db-manager/connections/${id}`);
}

/**
 * 获取数据库表列表
 * @param connectionId 连接ID
 */
export function getDatabaseTables(connectionId: number) {
  return http.get<DatabaseTable[]>(`/api/db-manager/connections/${connectionId}/tables`);
}

/**
 * 获取数据库表结构
 * @param connectionId 连接ID
 * @param tableName 表名
 */
export function getTableStructure(connectionId: number, tableName: string) {
  return http.get<DatabaseColumn[]>(`/api/db-manager/connections/${connectionId}/tables/${tableName}/structure`);
}

/**
 * 获取表数据
 * @param connectionId 连接ID
 * @param tableName 表名
 * @param params 查询参数
 */
export function getTableData(connectionId: number, tableName: string, params?: { page: number; pageSize: number }) {
  return http.get<QueryResult>(`/api/db-manager/connections/${connectionId}/tables/${tableName}/data`, { params });
}

/**
 * 执行SQL查询
 * @param connectionId 连接ID
 * @param sql SQL语句
 */
export function executeSql(connectionId: number, sql: string) {
  return http.post<QueryResult>(`/api/db-manager/connections/${connectionId}/execute`, { sql });
}
