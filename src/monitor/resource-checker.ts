/**
 * 资源完整性检查器
 */

import type { Page } from '@playwright/test';
import type { ResourceCheckResult, FailedResource, ResourcesByType } from './types.js';

/**
 * 创建资源完整性检查器
 * @param page Playwright Page 对象
 * @returns 检查结果
 */
export async function checkResources(page: Page): Promise<ResourceCheckResult> {
  try {
    const resourceData = await page.evaluate(() => {
      const resources = (performance as any).getEntriesByType('resource');
      const failedResources: Array<{ url: string; type: string }> = [];
      const resourcesByType: {
        image: number;
        stylesheet: number;
        script: number;
        font: number;
        xhr: number;
        other: number;
      } = {
        image: 0,
        stylesheet: 0,
        script: 0,
        font: 0,
        xhr: 0,
        other: 0,
      };

      for (const resource of resources) {
        const type = resource.initiatorType || 'other';

        switch (type.toLowerCase()) {
          case 'img':
          case 'image':
            resourcesByType.image++;
            break;
          case 'css':
          case 'link':
            resourcesByType.stylesheet++;
            break;
          case 'script':
            resourcesByType.script++;
            break;
          case 'font':
            resourcesByType.font++;
            break;
          case 'xmlhttprequest':
          case 'fetch':
            resourcesByType.xhr++;
            break;
          default:
            resourcesByType.other++;
        }

        if (resource.transferSize === 0 && resource.duration === 0) {
          failedResources.push({
            url: resource.name,
            type: type,
          });
        }
      }

      return {
        totalResources: resources.length,
        failedResources,
        resourcesByType,
      };
    });

    const failedResourcesList: FailedResource[] = resourceData.failedResources.map((r) => ({
      url: r.url,
      type: r.type,
      status: undefined,
      errorMessage: 'Resource failed to load or was blocked',
    }));

    return {
      totalResources: resourceData.totalResources,
      failedResources: failedResourcesList,
      resourcesByType: resourceData.resourcesByType,
      allResourcesLoaded: failedResourcesList.length === 0,
    };
  } catch (error) {
    console.warn('检查资源时出错:', error);
    return {
      totalResources: 0,
      failedResources: [],
      resourcesByType: {
        image: 0,
        stylesheet: 0,
        script: 0,
        font: 0,
        xhr: 0,
        other: 0,
      },
      allResourcesLoaded: true,
    };
  }
}

