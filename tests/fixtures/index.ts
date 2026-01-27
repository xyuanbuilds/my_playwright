import { test as base } from "@playwright/test";
import { URLQueryChecker } from "./helpers/url-query-checker";
import { PerformanceMonitor } from "./helpers/performance-monitor";
import { WebSocketMonitor } from "./helpers/websocket-monitor";
import { ApiMonitor } from "./helpers/api-monitor";

/**
 * 自定义 Fixtures 类型定义
 */
type CustomFixtures = {
  /**
   * URL Query 参数检测器
   * 用于验证和获取 URL 中的 query 参数
   */
  urlQuery: URLQueryChecker;

  /**
   * 性能监控器
   * 用于监控页面加载性能和网络请求
   */
  performance: PerformanceMonitor;

  /**
   * WebSocket 监控器
   * 用于监控 WebSocket 连接状态和消息
   */
  websocket: WebSocketMonitor;

  /**
   * API 监控器
   * 用于监控和验证 HTTP API 请求/响应
   */
  apiMonitor: ApiMonitor;
};

/**
 * 扩展 Playwright 的 test 对象，添加自定义 fixtures
 */
export const test = base.extend<CustomFixtures>({
  /**
   * URL Query 检测器 Fixture
   */
  urlQuery: async ({ page }, use) => {
    const checker = new URLQueryChecker(page);
    await use(checker);
  },

  /**
   * 性能监控器 Fixture
   * 自动开始监控
   */
  performance: async ({ page }, use) => {
    const monitor = new PerformanceMonitor(page);
    monitor.startMonitoring();
    await use(monitor);
  },
  /**
   * WebSocket 监控器 Fixture
   * 自动开始监控
   */
  websocket: async ({ page }, use) => {
    const monitor = new WebSocketMonitor(page);
    await monitor.startMonitoring();
    await use(monitor);
    // 测试结束后停止监控
    monitor.stopMonitoring();
  },

  /**
   * API 监控器 Fixture
   * 手动调用 start() 或 track() 开始监控
   */
  apiMonitor: async ({ page }, use) => {
    const monitor = new ApiMonitor(page);
    await use(monitor);
    // 测试结束后停止监控
    await monitor.stop();
  },
});

/**
 * 重新导出 expect，保持一致的导入体验
 */
export { expect } from "@playwright/test";

/**
 * 导出 Helper 类，供直接使用
 */
export { URLQueryChecker } from "./helpers/url-query-checker";
export { PerformanceMonitor } from "./helpers/performance-monitor";
export { WebSocketMonitor } from "./helpers/websocket-monitor";
export { ApiMonitor } from "./helpers/api-monitor";

/**
 * 导出工具函数
 */
export { waitForUIStable, waitForUIStableWithLog } from "./page-utils";
