import { camelCase, kebabCase, lowerFirst, upperFirst } from 'lodash';

/**
 * 将表名转换为类名
 * @param tableName 表名
 * @param prefix 前缀（可选，将被移除）
 */
export function tableNameToClassName(tableName: string, prefix?: string): string {
  let name = tableName;
  // 移除前缀
  if (prefix && name.startsWith(prefix)) {
    name = name.substring(prefix.length);
  }
  // 将下划线形式转换为驼峰形式，并确保首字母大写
  return upperFirst(camelCase(name));
}

/**
 * 将数据库列类型转换为 TypeScript 类型
 */
export function dbTypeToTsType(dbType: string): string {
  dbType = dbType.toLowerCase();

  if (dbType.includes('int') || dbType.includes('float') || dbType.includes('double') || dbType.includes('decimal') || dbType.includes('numeric')) {
    return 'number';
  } else if (dbType.includes('char') || dbType.includes('text') || dbType.includes('json') || dbType.includes('enum')) {
    return 'string';
  } else if (dbType.includes('date') || dbType.includes('time')) {
    return 'Date';
  } else if (dbType.includes('boolean') || dbType.includes('bit')) {
    return 'boolean';
  } else {
    return 'string'; // 默认为string
  }
}

/**
 * 将数据库列类型转换为适合表单的HTML类型
 */
export function dbTypeToHtmlType(dbType: string, columnName: string): string {
  dbType = dbType.toLowerCase();
  columnName = columnName.toLowerCase();

  // 根据列名猜测类型
  if (columnName.includes('content') || columnName.includes('description') || columnName.includes('remark')) {
    return 'textarea';
  } else if (columnName.includes('status') || columnName.includes('type') || columnName.includes('state')) {
    return 'select';
  } else if (columnName.includes('image') || columnName.includes('img') || columnName.includes('picture') || columnName.includes('avatar')) {
    return 'image';
  } else if (columnName.includes('file')) {
    return 'upload';
  } else if (columnName.includes('date') || columnName.includes('time')) {
    return 'datetime';
  } else if (dbType.includes('boolean') || dbType.includes('bit') || dbType.includes('tinyint(1)')) {
    return 'checkbox';
  } else {
    return 'input'; // 默认为input
  }
}

/**
 * 生成文件路径，替换变量
 */
export function generateFilePath(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const key in variables) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), variables[key]);
  }
  return result;
}

/**
 * 将下划线分隔的单词转为小驼峰
 */
export function toCamelCase(str: string): string {
  return camelCase(str);
}

/**
 * 将下划线分隔的单词转为大驼峰
 */
export function toPascalCase(str: string): string {
  return upperFirst(camelCase(str));
}

/**
 * 将字符串转为短横线分隔形式
 */
export function toKebabCase(str: string): string {
  return kebabCase(str);
}

/**
 * 将字符串首字母小写
 */
export function toLowerFirstCase(str: string): string {
  return lowerFirst(str);
}

/**
 * 将字符串首字母大写
 */
export function toUpperFirstCase(str: string): string {
  return upperFirst(str);
}
