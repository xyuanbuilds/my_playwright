import { test, expect, PLATFORMS, type PlatformType } from "../fixtures";

/**
 * PlatformContext Fixture 使用示例
 */

// ============== 示例 1: 单个平台测试 ==============
test("示例 1 - 支付宝平台", async ({ platformContext }) => {
  // 创建支付宝平台页面
  const { page, config } = await platformContext.createPlatformPage("alipay");

  console.log(`平台: ${config.name}`);

  // 访问页面
  await page.goto("https://www.baidu.com");

  // TODO: 添加你的测试逻辑
});

// ============== 示例 2: 遍历所有平台 ==============
test.describe("示例 2 - 遍历所有平台", () => {
  (Object.keys(PLATFORMS) as PlatformType[]).forEach((platformKey) => {
    const platform = PLATFORMS[platformKey];

    test(`${platform.name}`, async ({ platformContext }) => {
      // 创建平台页面
      const { page } = await platformContext.createPlatformPage(platformKey);

      // 访问页面
      await page.goto("https://www.baidu.com");

      // TODO: 添加你的测试逻辑

      // 截图
      await expect(page).toHaveScreenshot(`示例-${platform.name}.png`);
    });
  });
});

// ============== 示例 3: 自定义平台配置 ==============
test("示例 3 - 自定义平台", async ({ platformContext }) => {
  // 使用自定义配置创建平台
  const { page, config } = await platformContext.createPlatformPage({
    name: "iPhone 15 Pro",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    viewport: { width: 393, height: 852 },
  });

  console.log(`自定义平台: ${config.name}`);

  await page.goto("https://www.baidu.com");

  // TODO: 添加你的测试逻辑
});

// ============== 示例 4: 同时创建多个平台 ==============
test("示例 4 - 多平台对比", async ({ platformContext }) => {
  // 同时创建多个平台页面
  const alipay = await platformContext.createPlatformPage("alipay");
  const wechat = await platformContext.createPlatformPage("wechat");
  const h5 = await platformContext.createPlatformPage("h5");

  // 同时访问
  const url = "https://www.baidu.com";
  await Promise.all([
    alipay.page.goto(url),
    wechat.page.goto(url),
    h5.page.goto(url),
  ]);

  // TODO: 添加对比逻辑

  // fixture 会自动清理所有平台上下文
});
