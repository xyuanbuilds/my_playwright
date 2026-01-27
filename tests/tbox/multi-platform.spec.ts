import { test, expect, PLATFORMS, type PlatformType } from "../fixtures";
import type { DomainsFile } from "./type";
import * as fs from "fs";
import * as path from "path";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

test.describe("多平台测试", () => {
  // 为每个域名和每个平台创建测试
  domainsData.domains.forEach((domain) => {
    if (!domain.url) {
      console.warn(`跳过 ${domain.name} 测试: 缺少 url 配置`);
      return;
    }

    // 为每个平台创建测试
    (Object.keys(PLATFORMS) as PlatformType[]).forEach((platformKey) => {
      const platform = PLATFORMS[platformKey];

      test(`${domain.name} - ${platform.name}`, async ({
        platformContext,
      }) => {
        console.log(
          `\n========== 开始测试: ${domain.name} - ${platform.name} ==========\n`,
        );

        // 使用 platformContext 创建平台页面
        const { page, config } =
          await platformContext.createPlatformPage(platformKey);

        console.log(`平台: ${config.name}`);

        // 访问页面
        await page.goto(domain.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });

        // TODO: 在这里添加你的测试逻辑
        // 例如：
        // - 验证平台特定的 UI 元素
        // - 测试平台特定的功能
        // - 验证 API 调用
        // - 检查 WebSocket 消息

        await page.waitForTimeout(3000);

        // TODO: 添加断言验证
        // expect(...).toBe(...);

        // 截图
        await expect(page).toHaveScreenshot(
          `${domain.name}-${platform.name}.png`,
          {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
            animations: "disabled",
          },
        );

        console.log(
          `\n========== 测试结束: ${domain.name} - ${platform.name} ==========\n`,
        );
      });
    });
  });
});
