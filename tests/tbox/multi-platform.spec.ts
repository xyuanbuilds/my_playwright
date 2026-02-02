import {
  test,
  expect,
  PLATFORMS,
  type PlatformType,
  waitForUIStable,
} from "../fixtures";
import type { DomainsFile } from "./type";
import * as fs from "fs";
import * as path from "path";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

const cardTestDomain = domainsData.domains.find(
  (domain) => domain.name === "卡片综合",
);

test.describe.serial("多平台测试", () => {
  const domain = cardTestDomain!;

  // 为每个平台创建测试（串行执行，避免输出混乱）
  (Object.keys(PLATFORMS) as PlatformType[]).forEach((platformKey) => {
    const platform = PLATFORMS[platformKey];

    test(`${domain.name} - ${platform.name}`, async ({
      platformContext,
      myAgent,
    }) => {
      console.log(
        `\n========== 开始测试: ${domain.name} - ${platform.name} ==========\n`,
      );

      // 使用 platformContext 创建平台页面
      const { page, config } =
        await platformContext.createPlatformPage(platformKey);
      // 将 myAgent 的 page 更新为当前平台页面
      (myAgent as any).page = page;

      console.log(`平台: ${config.name}`);

      // 访问页面
      await page.goto(domain.queryUrl!, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await waitForUIStable(page, { maxWaitTime: 3000 });

      // 等待页面加载完成
      await page.waitForTimeout(3000);

      // 支付宝平台：检测 iframe
      if (platformKey === "alipay") {
        console.log("🔍 检测支付宝场景下的 iframe...");

        // 获取页面中的所有 iframe
        const allIframes = page.locator("iframe");
        const totalCount = await allIframes.count();

        console.log(`找到 ${totalCount} 个 iframe`);

        // 过滤出聊天消息中的 iframe（排除 preloadList 和 historyWrapper）
        const validIframes: Array<{
          index: number;
          src: string;
          id: string;
          name: string;
          width: string;
          height: string;
          display: string;
          visibility: string;
        }> = [];

        for (let i = 0; i < totalCount; i++) {
          const iframe = allIframes.nth(i);

          // 使用 MyAgent 检查是否在聊天消息中
          const isChatMsg = await myAgent.isChatMsgElement(iframe);
          if (!isChatMsg) continue;

          // 获取 iframe 信息
          const info = await iframe.evaluate((el) => {
            const iframe = el as HTMLIFrameElement;
            const computedStyle = window.getComputedStyle(iframe);
            return {
              src: iframe.src || "",
              id: iframe.id || "",
              name: iframe.name || "",
              width: iframe.width || computedStyle.width,
              height: iframe.height || computedStyle.height,
              display: computedStyle.display,
              visibility: computedStyle.visibility,
            };
          });

          validIframes.push({
            index: validIframes.length + 1,
            ...info,
          });
        }

        const hasIframe = validIframes.length > 0;
        const filteredCount = totalCount - validIframes.length;

        console.log(`iframe 检测结果: ${hasIframe ? "✅ 存在" : "❌ 不存在"}`);
        console.log(
          `找到 ${validIframes.length} 个有效 iframe (总共 ${totalCount} 个，过滤 ${filteredCount} 个)`,
        );

        if (validIframes.length > 0) {
          console.log("iframe 详情:", JSON.stringify(validIframes, null, 2));
        }

        // 如果没有检测到 iframe，等待更长时间后再试一次
        if (!hasIframe) {
          console.log("⏰ 未检测到 iframe，等待 5 秒后重试...");
          await page.waitForTimeout(5000);

          const retryCount = await allIframes.count();
          let retryValidCount = 0;

          for (let i = 0; i < retryCount; i++) {
            const iframe = allIframes.nth(i);
            const isChatMsg = await myAgent.isChatMsgElement(iframe);
            if (isChatMsg) retryValidCount++;
          }

          console.log(
            `重试结果: ${retryValidCount > 0 ? "✅ 检测到" : "❌ 仍未检测到"}`,
          );
        }

        expect(hasIframe).toBe(true);
      }

      // 微信平台：检测 shadow dom
      if (platformKey === "wechat-ios") {
        console.log("🔍 检测微信场景下的 Shadow DOM...");

        // 先打印页面基本信息用于调试
        const pageInfo = await page.evaluate(() => {
          return {
            title: document.title,
            url: window.location.href,
            bodyChildrenCount: document.body.children.length,
            bodyHTML: document.body.innerHTML.substring(0, 500), // 只取前500字符
          };
        });
        console.log("页面信息:", JSON.stringify(pageInfo, null, 2));

        // 查找所有元素，优先过滤聊天消息内元素（避免无效内容）
        const allElements = page.locator("*");
        const totalCount = await allElements.count();

        console.log(`页面总元素数: ${totalCount}`);

        // 过滤出聊天消息中的 Shadow Host
        const validShadowHosts: Array<{
          tagName: string;
          id: string;
          className: string;
          childCount: number;
          innerHTML: string;
        }> = [];

        let totalShadowHosts = 0;

        for (let i = 0; i < totalCount; i++) {
          const element = allElements.nth(i);

          // 先判断是否在聊天消息中，过滤无效元素
          const isChatMsg = await myAgent.isChatMsgElement(element);
          if (!isChatMsg) continue;

          const elementInfo = await element.evaluate((el) => {
            const hasShadowRoot = !!el.shadowRoot;
            return {
              tagName: el.tagName.toLowerCase(),
              id: (el as HTMLElement).id || "",
              className:
                typeof (el as HTMLElement).className === "string"
                  ? (el as HTMLElement).className
                  : "",
              hasShadowRoot,
            };
          });

          if (!elementInfo.hasShadowRoot) continue;

          totalShadowHosts++;

          const shadowInfo = await element.evaluate((el) => {
            if (!el.shadowRoot) return null;
            return {
              childCount: el.shadowRoot.childElementCount,
              innerHTML: el.shadowRoot.innerHTML?.substring(0, 200) || "",
            };
          });

          if (shadowInfo) {
            validShadowHosts.push({
              tagName: elementInfo.tagName,
              id: elementInfo.id,
              className: elementInfo.className,
              ...shadowInfo,
            });
          }
        }

        const hasShadowDom = validShadowHosts.length > 0;
        const filteredCount = totalShadowHosts - validShadowHosts.length;

        console.log(
          `Shadow DOM 检测结果: ${hasShadowDom ? "✅ 存在" : "❌ 不存在"}`,
        );
        console.log(
          `找到 ${validShadowHosts.length} 个有效 Shadow Host (聊天消息中总共 ${totalShadowHosts} 个，过滤 ${filteredCount} 个)`,
        );

        if (validShadowHosts.length > 0) {
          console.log(
            "Shadow Host 详情:",
            JSON.stringify(validShadowHosts, null, 2),
          );
        }

        expect(hasShadowDom).toBe(true);
      }

      // 截图
      // await expect(page).toHaveScreenshot(
      //   `${domain.name}-${platform.name}.png`,
      //   {
      //     fullPage: true,
      //     maxDiffPixelRatio: 0.02,
      //     animations: "disabled",
      //   },
      // );

      console.log(
        `\n========== 测试结束: ${domain.name} - ${platform.name} ==========\n`,
      );
    });
  });
});
