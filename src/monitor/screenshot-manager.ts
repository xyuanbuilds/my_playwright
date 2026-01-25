/**
 * 截图管理器
 */

import type { Page } from '@playwright/test';
import * as path from 'path';
import { formatDate } from '../utils/date-helper.js';
import { ensureDir, extractDomain } from '../utils/file-helper.js';

/**
 * 截图并保存
 * @param page Playwright Page 对象
 * @param url 网址
 * @param timestamp 时间戳
 * @returns 截图文件的相对路径
 */
export async function takeScreenshot(
  page: Page,
  url: string,
  timestamp: string
): Promise<string> {
  const domain = extractDomain(url);
  const date = formatDate(new Date());
  const filename = `${timestamp}-${domain}.png`;

  const dirPath = path.join(process.cwd(), 'detection-screenshots', date);
  const filePath = path.join(dirPath, filename);

  await ensureDir(dirPath);

  await page.screenshot({
    path: filePath,
    fullPage: true,
  });

  return path.join('detection-screenshots', date, filename);
}
