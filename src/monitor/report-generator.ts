/**
 * 报告生成器
 */

import * as path from 'path';
import type {
  DetectionResult,
  BatchSummary,
  BatchResultSummary,
  BatchStatsSummary,
  DailyIndex,
  DetectionIndexItem,
} from './types.js';
import { saveJson, readJson, extractDomain } from '../utils/file-helper.js';

/**
 * 保存单个检测结果
 * @param result 检测结果
 * @param date 日期字符串 (YYYY-MM-DD)
 */
export async function saveSingleResult(
  result: DetectionResult,
  date: string
): Promise<void> {
  const domain = extractDomain(result.url);
  const filename = `${result.detectionTime}-${domain}.json`;
  const filePath = path.join(
    process.cwd(),
    'detection-records',
    date,
    filename
  );

  await saveJson(filePath, result);
}

/**
 * 生成批量检测汇总报告
 * @param results 检测结果数组
 * @param date 日期字符串 (YYYY-MM-DD)
 * @param timestamp 时间戳 (HHmmss)
 * @returns 批量汇总报告
 */
export async function generateBatchSummary(
  results: DetectionResult[],
  date: string,
  timestamp: string
): Promise<BatchSummary> {
  const successResults = results.filter((r) => r.status === 'success');
  const failedResults = results.filter((r) => r.status === 'failed');

  const loadTimes = successResults
    .map((r) => r.loadTime)
    .filter((t): t is number => typeof t === 'number');

  const averageLoadTime =
    loadTimes.length > 0
      ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length
      : undefined;

  let fastestUrl: string | undefined;
  let slowestUrl: string | undefined;

  if (loadTimes.length > 0) {
    const minLoadTime = Math.min(...loadTimes);
    const maxLoadTime = Math.max(...loadTimes);

    fastestUrl = successResults.find((r) => r.loadTime === minLoadTime)?.url;
    slowestUrl = successResults.find((r) => r.loadTime === maxLoadTime)?.url;
  }

  const totalResourcesChecked = results.reduce((sum, r) => {
    return sum + (r.resourceCheck?.totalResources || 0);
  }, 0);

  const totalFailedResources = results.reduce((sum, r) => {
    return sum + (r.resourceCheck?.failedResources.length || 0);
  }, 0);

  const batchResultSummaries: BatchResultSummary[] = results.map((r) => {
    const domain = extractDomain(r.url);
    return {
      url: r.url,
      status: r.status,
      loadTime: r.loadTime,
      httpStatus: r.httpStatus,
      detailPath: `detection-records/${date}/${r.detectionTime}-${domain}.json`,
    };
  });

  const summary: BatchStatsSummary = {
    averageLoadTime,
    fastestUrl,
    slowestUrl,
    totalResourcesChecked,
    totalFailedResources,
  };

  const startTime = new Date(results[0].timestamp).getTime();
  const endTime = new Date(results[results.length - 1].timestamp).getTime();
  const totalDetectionTime = endTime - startTime;

  const batchSummary: BatchSummary = {
    batchId: `batch-${date.replace(/-/g, '')}-${timestamp}`,
    timestamp: results[0].timestamp,
    totalUrls: results.length,
    successCount: successResults.length,
    failedCount: failedResults.length,
    totalDetectionTime,
    results: batchResultSummaries,
    summary,
  };

  const filename = `${timestamp}-batch-summary.json`;
  const filePath = path.join(
    process.cwd(),
    'detection-records',
    date,
    filename
  );

  await saveJson(filePath, batchSummary);

  await updateIndex(date, {
    timestamp,
    type: 'batch',
    urls: results.map((r) => r.url),
    summaryPath: filename,
  });

  return batchSummary;
}

/**
 * 更新当日检测记录索引
 * @param date 日期字符串 (YYYY-MM-DD)
 * @param indexItem 索引项
 */
export async function updateIndex(
  date: string,
  indexItem: DetectionIndexItem
): Promise<void> {
  const indexPath = path.join(
    process.cwd(),
    'detection-records',
    date,
    'index.json'
  );

  const existingIndex = await readJson<DailyIndex>(indexPath);

  const dailyIndex: DailyIndex = existingIndex || {
    date,
    detections: [],
  };

  dailyIndex.detections.push(indexItem);

  await saveJson(indexPath, dailyIndex);
}
