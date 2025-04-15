import { request as http } from '@/utils/http';
import { 
  CodeGenerator, 
  CodeGeneratorColumn, 
  CodeGeneratorQueryParams, 
  TableInfo,
  CodePreview
} from '@/types/code-generator';

/**
 * 获取代码生成器列表
 * @param params 查询参数
 */
export function getCodeGeneratorList(params: CodeGeneratorQueryParams) {
  return http.get<{ total: number; list: CodeGenerator[] }>('/api/code-generator', { params });
}

/**
 * 获取代码生成器详情
 * @param id 代码生成器ID
 */
export function getCodeGenerator(id: number) {
  return http.get<CodeGenerator & { columns: CodeGeneratorColumn[] }>(`/api/code-generator/detail/${id}`);
}

/**
 * 创建代码生成器
 * @param data 代码生成器数据
 */
export function createCodeGenerator(data: Partial<CodeGenerator>) {
  return http.post<CodeGenerator>('/api/code-generator', data);
}

/**
 * 更新代码生成器
 * @param id 代码生成器ID
 * @param data 代码生成器数据
 */
export function updateCodeGenerator(id: number, data: Partial<CodeGenerator>) {
  return http.put<CodeGenerator>(`/api/code-generator/update/${id}`, data);
}

/**
 * 删除代码生成器
 * @param id 代码生成器ID
 */
export function deleteCodeGenerator(id: number) {
  return http.delete(`/api/code-generator/delete/${id}`);
}

/**
 * 获取数据库表列表
 */
export function getTableList() {
  return http.get<TableInfo[]>('/api/code-generator/tables');
}

/**
 * 同步表结构
 * @param id 代码生成器ID
 */
export function syncTableColumns(id: number) {
  return http.post<CodeGeneratorColumn[]>('/api/code-generator/sync-columns', { id });
}

/**
 * 导入表结构
 * @param generatorId 代码生成器ID
 * @param tableName 表名
 */
export function importTableColumns(generatorId: number, tableName: string) {
  return http.post<CodeGeneratorColumn[]>('/api/code-generator/import-columns', { generatorId, tableName });
}

/**
 * 创建代码生成器列
 * @param data 列数据
 */
export function createCodeGeneratorColumn(data: Partial<CodeGeneratorColumn>) {
  return http.post<CodeGeneratorColumn>('/api/code-generator/column', data);
}

/**
 * 更新代码生成器列
 * @param id 列ID
 * @param data 列数据
 * @param generatorId 生成器ID
 */
export function updateCodeGeneratorColumn(id: number, data: Partial<CodeGeneratorColumn>, generatorId: number) {
  // 将id和generatorId一起添加到请求体中
  return http.put<CodeGeneratorColumn>('/api/code-generator/column', { 
    ...data, 
    id,
    generatorId   // 确保包含生成器ID
  });
}

/**
 * 删除代码生成器列
 * @param id 列ID
 */
export function deleteCodeGeneratorColumn(id: number) {
  return http.delete(`/api/code-generator/column/${id}`);
}

/**
 * 预览代码
 * @param id 代码生成器ID
 */
export function previewCode(id: number) {
  return http.post<CodePreview[]>('/api/code-generator/preview', { id });
}

/**
 * 生成代码
 * @param id 代码生成器ID
 */
export function generateCode(id: number) {
  return http.post<Blob>('/api/code-generator/generate', { id }, {
    responseType: 'blob'
  });
}

/**
 * 执行SQL语句
 * @param sql SQL语句
 */
export function executeSql(sql: string) {
  return http.post<any>('/api/code-generator/execute-sql', { sql });
}