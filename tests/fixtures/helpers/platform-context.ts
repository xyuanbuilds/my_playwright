import type { Browser, BrowserContext, Page } from "@playwright/test";

/**
 * 平台配置类型
 */
export interface PlatformConfig {
  /** 平台名称 */
  name: string;
  /** User-Agent 字符串 */
  userAgent: string;
  /** 视口尺寸 */
  viewport: { width: number; height: number };
}

/**
 * 平台类型
 */
export type PlatformType = "alipay" | "wechat" | "wechat-ios";

/**
 * 预定义的平台配置
 */
export const PLATFORMS: Record<PlatformType, PlatformConfig> = {
  alipay: {
    name: "支付宝",
    userAgent:
      "Mozilla/5.0 (Linux; U; Android 12; zh-CN; MI 11 Build/SKQ1.211006.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 AlipayClient/10.5.0.8150",
    viewport: { width: 375, height: 812 },
  },
  wechat: {
    name: "微信",
    userAgent:
      "Mozilla/5.0 (Linux; Android 12; MI 11 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 MicroMessenger/8.0.38.2400(0x28002657) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
    viewport: { width: 375, height: 812 },
  },
  "wechat-ios": {
    name: "微信iOS",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38 NetType/WIFI Language/zh_CN",
    viewport: { width: 390, height: 844 },
  },
  // h5: {
  //   name: "普通H5",
  //   userAgent:
  //     "Mozilla/5.0 (Linux; Android 12; MI 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  //   viewport: { width: 375, height: 812 },
  // },
};

/**
 * 平台上下文管理器
 * 用于创建和管理不同平台的浏览器上下文
 */
export class PlatformContext {
  private browser: Browser;
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * 创建指定平台的上下文和页面
   * @param platform 平台类型或自定义配置
   * @returns 包含 context、page 和 config 的对象
   */
  async createPlatformPage(platform: PlatformType | PlatformConfig): Promise<{
    context: BrowserContext;
    page: Page;
    config: PlatformConfig;
  }> {
    // 获取平台配置
    const config: PlatformConfig =
      typeof platform === "string" ? PLATFORMS[platform] : platform;

    // 创建上下文
    const context = await this.browser.newContext({
      userAgent: config.userAgent,
      viewport: config.viewport,
    });

    // 创建页面
    const page = await context.newPage();

    // 保存引用
    const key = config.name;
    this.contexts.set(key, context);
    this.pages.set(key, page);

    console.log(`✅ 已创建 ${config.name} 平台上下文`);

    return { context, page, config };
  }

  /**
   * 清理所有创建的上下文和页面
   */
  async cleanup(): Promise<void> {
    // 关闭所有页面
    for (const page of this.pages.values()) {
      await page.close();
    }

    // 关闭所有上下文
    for (const context of this.contexts.values()) {
      await context.close();
    }

    this.pages.clear();
    this.contexts.clear();

    console.log("✅ 已清理所有平台上下文");
  }
}
