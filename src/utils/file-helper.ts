/**
 * 文件操作工具函数
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * 保存 JSON 数据到文件
 * @param filePath 文件路径
 * @param data 要保存的数据
 */
export async function saveJson(filePath: string, data: any): Promise<void> {
  const dirPath = path.dirname(filePath);
  await ensureDir(dirPath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 读取 JSON 文件
 * @param filePath 文件路径
 * @returns 解析后的 JSON 数据
 */
export async function readJson<T = any>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    return null;
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从 URL 中提取域名
 * @param url 网址
 * @returns 域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'invalid-url';
  }
}

/**
 * 验证 URL 格式
 * @param url 网址
 * @returns URL 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
