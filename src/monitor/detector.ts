/**
 * 核心检测器
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import type { DetectionResult } from './types.js';
import { formatTime } from '../utils/date-helper.js';
import { collectPerformanceMetrics } from './performance-collector.js';
import { checkResources } from './resource-checker.js';
import { takeScreenshot } from './screenshot-manager.js';

/**
 * 检测单个网站
 * @param url 网址
 * @param browser 可选的浏览器实例（用于批量检测时复用）
 * @returns 检测结果
 */
export async function detectWebsite(
  url: string,
  browser?: Browser
): Promise<DetectionResult> {
  const shouldCloseBrowser = !browser;
  const browserInstance = browser || (await chromium.launch());
  const detectionTime = formatTime(new Date());
  const timestamp = new Date().toISOString();

  let page: Page | null = null;

  try {
    page = await browserInstance.newPage();

    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    const httpStatus = response?.status();

    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});

    const performanceMetrics = await collectPerformanceMetrics(page);

    const resourceCheck = await checkResources(page);

    let screenshotPath: string | undefined;
    try {
      screenshotPath = await takeScreenshot(page, url, detectionTime);
    } catch (error) {
      console.warn(`截图失败 (${url}):`, error);
    }

    return {
      url,
      timestamp,
      detectionTime,
      status: 'success',
      httpStatus,
      loadTime: performanceMetrics.totalLoadTime,
      performanceMetrics,
      resourceCheck,
      screenshotPath,
    };
  } catch (error: any) {
    let screenshotPath: string | undefined;
    if (page) {
      try {
        screenshotPath = await takeScreenshot(page, url, detectionTime);
      } catch {
        // 忽略截图错误
      }
    }

    return {
      url,
      timestamp,
      detectionTime,
      status: 'failed',
      error: error.message || 'Unknown error',
      errorType: getErrorType(error),
      screenshotPath,
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }

    if (shouldCloseBrowser && browserInstance) {
      await browserInstance.close().catch(() => {});
    }
  }
}

/**
 * 批量检测网站
 * @param urls 网址数组
 * @returns 检测结果数组
 */
export async function detectBatch(urls: string[]): Promise<DetectionResult[]> {
  const browser = await chromium.launch();
  const results: DetectionResult[] = [];

  try {
    for (const url of urls) {
      const result = await detectWebsite(url, browser);
      results.push(result);
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}

/**
 * 获取错误类型
 * @param error 错误对象
 * @returns 错误类型
 */
function getErrorType(error: any): string {
  const message = error.message || '';

  if (message.includes('Navigation') || message.includes('net::')) {
    return 'navigation';
  } else if (message.includes('Timeout')) {
    return 'timeout';
  } else if (message.includes('SSL') || message.includes('certificate')) {
    return 'ssl';
  } else {
    return 'unknown';
  }
}
