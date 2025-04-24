/**
 * 文件工具类
 * 提供常用的文件操作方法
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';

// 将常用的 fs 方法转换为 Promise 版本
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);

/**
 * 读取文件内容
 * @param filePath 文件路径
 * @param encoding 编码方式
 * @returns 文件内容
 */
export async function readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  return await readFileAsync(filePath, { encoding });
}

/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @param encoding 编码方式
 */
export async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await writeFileAsync(filePath, content, { encoding });
}

/**
 * 确保目录存在，如不存在则创建
 * @param dir 目录路径
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await statAsync(dir);
  } catch (err) {
    // 目录不存在，创建目录
    await mkdirAsync(dir, { recursive: true });
  }
}

/**
 * 获取文件后缀名
 * @param filename 文件名
 * @returns 后缀名（不含点号）
 */
export function getFileExt(filename: string): string {
  return path.extname(filename).slice(1).toLowerCase();
}

/**
 * 获取文件名（不含路径和后缀）
 * @param filename 文件名
 * @returns 文件名（不含路径和后缀）
 */
export function getFileName(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

/**
 * 计算文件的MD5值
 * @param filePath 文件路径
 * @returns MD5哈希值
 */
export async function getFileMd5(filePath: string): Promise<string> {
  const buffer = await readFileAsync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(size: number, decimals: number = 2): string {
  if (size === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(size) / Math.log(k));

  return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await statAsync(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 列出目录下的所有文件
 * @param dirPath 目录路径
 * @param recursive 是否递归子目录
 * @returns 文件路径列表
 */
export async function listFiles(dirPath: string, recursive: boolean = false): Promise<string[]> {
  const result: string[] = [];
  const files = await readdirAsync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await statAsync(fullPath);

    if (stat.isFile()) {
      result.push(fullPath);
    } else if (stat.isDirectory() && recursive) {
      const subFiles = await listFiles(fullPath, recursive);
      result.push(...subFiles);
    }
  }

  return result;
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export async function deleteFile(filePath: string): Promise<void> {
  if (await fileExists(filePath)) {
    await unlinkAsync(filePath);
  }
}