import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 配置文件
 * 文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试文件目录
  testDir: "./tests",

  // 每个测试的超时时间（30秒）
  timeout: 30 * 1000,

  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告配置
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  // 快照路径与首次生成策略
  snapshotPathTemplate: "snapshot/{testFilePath}/{arg}{ext}",
  updateSnapshots: "missing",

  // 全局配置
  use: {
    // 基础 URL，可以通过环境变量配置
    baseURL: process.env.BASE_URL || "https://m.alipay.com",

    // 追踪配置 - 失败时保留
    trace: "on-first-retry",

    // 截图配置
    screenshot: "only-on-failure",

    // 视频录制
    video: "retain-on-failure",

    // 浏览器语言
    locale: "zh-CN",

    // 时区
    timezoneId: "Asia/Shanghai",
  },

  // 项目配置 - 针对不同设备
  projects: [
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // 自定义视口大小（支付宝常见分辨率）
        viewport: { width: 375, height: 667 },
      },
    },

    // {
    //   name: "Mobile Safari",
    //   use: {
    //     ...devices["iPhone 12"],
    //     viewport: { width: 390, height: 844 },
    //   },
    // },

    // // 桌面浏览器配置（可选）
    // {
    //   name: "Desktop Chrome",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //   },
    // },
  ],

  // Web Server 配置（如果需要启动本地服务器）
  // webServer: {
  //   command: 'pnpm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
