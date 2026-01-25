/**
 * 网站检测工具类型定义
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  timeToFirstByte: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  totalRequests: number;
  totalSize: number;
  totalLoadTime: number;
}

/**
 * 失败的资源
 */
export interface FailedResource {
  url: string;
  type: string;
  status?: number;
  errorMessage?: string;
}

/**
 * 资源类型统计
 */
export interface ResourcesByType {
  image: number;
  stylesheet: number;
  script: number;
  font: number;
  xhr: number;
  other: number;
}

/**
 * 资源完整性检查结果
 */
export interface ResourceCheckResult {
  totalResources: number;
  failedResources: FailedResource[];
  resourcesByType: ResourcesByType;
  allResourcesLoaded: boolean;
}

/**
 * 检测结果状态
 */
export type DetectionStatus = 'success' | 'failed';

/**
 * 单个网址检测结果
 */
export interface DetectionResult {
  url: string;
  timestamp: string;
  detectionTime: string;
  status: DetectionStatus;
  httpStatus?: number;
  loadTime?: number;
  performanceMetrics?: PerformanceMetrics;
  resourceCheck?: ResourceCheckResult;
  screenshotPath?: string;
  error?: string;
  errorType?: string;
}

/**
 * 批量检测中单个结果摘要
 */
export interface BatchResultSummary {
  url: string;
  status: DetectionStatus;
  loadTime?: number;
  httpStatus?: number;
  detailPath: string;
}

/**
 * 批量检测统计摘要
 */
export interface BatchStatsSummary {
  averageLoadTime?: number;
  fastestUrl?: string;
  slowestUrl?: string;
  totalResourcesChecked?: number;
  totalFailedResources?: number;
}

/**
 * 批量检测汇总报告
 */
export interface BatchSummary {
  batchId: string;
  timestamp: string;
  totalUrls: number;
  successCount: number;
  failedCount: number;
  totalDetectionTime: number;
  results: BatchResultSummary[];
  summary: BatchStatsSummary;
}

/**
 * 检测记录索引项
 */
export interface DetectionIndexItem {
  timestamp: string;
  type: 'single' | 'batch';
  url?: string;
  urls?: string[];
  detailPath?: string;
  summaryPath?: string;
}

/**
 * 每日检测记录索引
 */
export interface DailyIndex {
  date: string;
  detections: DetectionIndexItem[];
}
