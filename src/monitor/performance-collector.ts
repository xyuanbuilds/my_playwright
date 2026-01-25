/**
 * 性能指标收集器
 */

import type { Page } from '@playwright/test';
import type { PerformanceMetrics } from './types.js';

/**
 * 收集页面性能指标
 * @param page Playwright Page 对象
 * @returns 性能指标数据
 */
export async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  try {
    const metrics = await page.evaluate(() => {
      const perfData = (performance as any).getEntriesByType('navigation')[0];

      if (!perfData) {
        throw new Error('Navigation timing data not available');
      }

      const navigationStart = perfData.fetchStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
      const loadComplete = perfData.loadEventEnd - perfData.fetchStart;
      const timeToFirstByte = perfData.responseStart - perfData.requestStart;

      const paintEntries = (performance as any).getEntriesByType('paint');
      const fcpEntry = paintEntries.find((entry: any) => entry.name === 'first-contentful-paint');
      const firstContentfulPaint = fcpEntry ? fcpEntry.startTime : undefined;

      const resourceEntries = (performance as any).getEntriesByType('resource');
      const totalRequests = resourceEntries.length + 1;
      const totalSize = resourceEntries.reduce((sum: number, resource: any) => {
        return sum + (resource.transferSize || 0);
      }, 0);

      const totalLoadTime = loadComplete;

      return {
        navigationStart,
        domContentLoaded,
        loadComplete,
        timeToFirstByte,
        firstContentfulPaint,
        totalRequests,
        totalSize,
        totalLoadTime,
      };
    });

    const lcpMetric = await collectLCP(page);

    return {
      ...metrics,
      largestContentfulPaint: lcpMetric,
    };
  } catch (error) {
    console.warn('收集性能指标时出错:', error);
    return {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      timeToFirstByte: 0,
      totalRequests: 0,
      totalSize: 0,
      totalLoadTime: 0,
    };
  }
}

/**
 * 收集 LCP (Largest Contentful Paint) 指标
 * @param page Playwright Page 对象
 * @returns LCP 值（毫秒）
 */
async function collectLCP(page: Page): Promise<number | undefined> {
  try {
    const lcp = await page.evaluate(() => {
      return new Promise<number | undefined>((resolve) => {
        let lcpValue: number | undefined;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        });

        observer.observe({ type: 'largest-contentful-paint' as any, buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 100);
      });
    });

    return lcp;
  } catch {
    return undefined;
  }
}
