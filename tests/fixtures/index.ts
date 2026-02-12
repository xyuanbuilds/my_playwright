import { test as base } from "@playwright/test";
import fs from "fs";
import util from "util";
import { URLQueryChecker } from "./helpers/url-query-checker";
import { PerformanceMonitor } from "./helpers/performance-monitor";
import { WebSocketMonitor } from "./helpers/websocket-monitor";
import { ApiMonitor } from "./helpers/api-monitor";
import { PlatformContext } from "./helpers/platform-context";
import { MyAgent } from "./helpers/my-agent";

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

  /**
   * 平台上下文管理器
   * 用于创建和管理不同平台（支付宝、微信、H5）的浏览器上下文
   */
  platformContext: PlatformContext;

  /**
   * 智能体对话助手
   * 用于简化与智能体对话页面的交互操作
   */
  myAgent: MyAgent;
};

type AutoFixtures = {
  /** 自动为每个用例隔离 console.log 日志 */
  _consoleCapture: void;
};

/**
 * 扩展 Playwright 的 test 对象，添加自定义 fixtures
 */
export const test = base.extend<CustomFixtures & AutoFixtures>({
  /**
   * 自动捕获每个用例的 console.log，写入独立文件并保持原始 stdout 输出
   */
  _consoleCapture: [
    async ({}, use, testInfo) => {
      const originalLog = console.log;
      const logPath = testInfo.outputPath("log");
      const stream = fs.createWriteStream(logPath, { flags: "a" });

      console.log = (...args: unknown[]) => {
        const formatted = util.format(...args);
        const line = `[${new Date().toISOString()}] [${testInfo.title}] ${formatted}`;
        stream.write(`${line}\n`);
        originalLog(...args);
      };

      try {
        await use();
      } finally {
        console.log = originalLog;
        stream.end();
      }
    },
    { auto: true },
  ],

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

  /**
   * 平台上下文管理器 Fixture
   * 用于创建和管理不同平台的浏览器上下文
   */
  platformContext: async ({ browser }, use) => {
    const platformContext = new PlatformContext(browser);
    await use(platformContext);
    // 测试结束后清理所有上下文
    await platformContext.cleanup();
  },

  /**
   * 智能体对话助手 Fixture
   * 用于简化与智能体对话页面的交互操作
   */
  myAgent: async ({ page }, use) => {
    const agent = new MyAgent(page);
    await use(agent);
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
export {
  PlatformContext,
  PLATFORMS,
  type PlatformConfig,
  type PlatformType,
} from "./helpers/platform-context";
export { MyAgent, type MyAgentOptions } from "./helpers/my-agent";

/**
 * 导出工具函数
 */
export { waitForUIStable, waitForUIStableWithLog } from "./page-utils";
