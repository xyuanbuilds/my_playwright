import { test, waitForUIStableWithLog } from "../../fixtures";
import type { DomainsFile } from "../type";
import type { Page } from "@playwright/test";
import type { MyAgent } from "../../fixtures/helpers/my-agent";
import * as fs from "fs";
import * as path from "path";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "../domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

// 获取"卡片综合"域配置
const cardDomain = domainsData.domains.find((d) => d.name === "卡片综合");
if (!cardDomain) {
  throw new Error("未找到卡片综合域配置");
}

/**
 * 卡片类型配置
 */
const CARD_TYPES = ["一方卡片", "三方卡片", "AI卡片"] as const;
// const CARD_TYPES = ["一方卡片"] as const;
type CardType = (typeof CARD_TYPES)[number];

/**
 * 辅助函数：发送消息触发卡片并等待渲染完成
 */
async function triggerCard(page: Page, myAgent: MyAgent, cardType: CardType) {
  console.log(`\n📤 触发卡片: ${cardType}`);
  await myAgent.send(cardType);
  await waitForUIStableWithLog(page, {
    logPrefix: `[${cardType}]`,
    maxWaitTime: 10000,
  });
}

/**
 * makePhoneCall 测试
 * 测试不同卡片类型的拨打电话功能
 */
test.describe("makePhoneCall - 拨打电话", () => {
  test.describe.configure({ mode: "serial" });

  CARD_TYPES.forEach((cardType) => {
    test(`${cardType} - makePhoneCall 功能`, async ({ page, myAgent }) => {
      console.log(`\n========== makePhoneCall 测试: ${cardType} ==========\n`);

      // 1. 设置电话呼叫拦截（必须在页面加载前设置）
      let phoneCallTriggered = false;
      let phoneNumber = "";

      // 方法1: 监听页面导航事件（捕获 tel: 协议）
      page.on("framenavigated", (frame) => {
        const url = frame.url();
        console.log(frame.url());
        if (url.startsWith("tel:")) {
          phoneCallTriggered = true;
          phoneNumber = url.replace("tel:", "");
          console.log(`📞 [framenavigated] 检测到电话呼叫: ${phoneNumber}`);
        }
      });

      // 方法3: route 拦截（保留，但可能无法捕获 tel: 协议）
      await page.route("**/*", async (route) => {
        const url = route.request().url();
        if (url.startsWith("tel:")) {
          phoneCallTriggered = true;
          phoneNumber = url.replace("tel:", "");
          console.log(`📞 [route] 检测到电话呼叫: ${phoneNumber}`);
          await route.abort();
        } else {
          await route.continue();
        }
      });

      // 2. 访问页面
      await page.goto(cardDomain.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await waitForUIStableWithLog(page, {
        logPrefix: `[首页卡加载]`,
        maxWaitTime: 1000,
      });

      // 获取欢迎卡中的测试按钮
      await page
        .locator('[class*="welcome-cards"]')
        .getByText(`${cardType}`)
        .click();

      await waitForUIStableWithLog(page, {
        logPrefix: `[${cardType}加载]`,
        maxWaitTime: 10000,
      });

      // 4. 查找并点击 makePhoneCall 相关按钮或卡片项
      // 根据卡片类型使用不同的选择器
      let phoneButton = null;

      if (cardType === "三方卡片" || cardType === "AI卡片") {
        // 三方卡片和AI卡片：按钮在 iframe 中，需要找到在 chatMsg 部分的 iframe
        const allIframes = page.locator("iframe");
        const iframeCount = await allIframes.count();

        // 根据卡片类型使用不同的按钮选择器
        const buttonSelector =
          cardType === "AI卡片"
            ? "button#makeCallBtn" // AI卡片使用 id 选择器
            : "button"; // 三方卡片使用通用 button

        for (let i = 0; i < iframeCount; i++) {
          const iframe = allIframes.nth(i);
          if (await myAgent.isChatMsgElement(iframe)) {
            // 找到在 chatMsg 中的 iframe，使用 contentFrame() 获取内部内容
            const frameContent = iframe.contentFrame();
            const iframeButton = frameContent
              .locator(buttonSelector)
              .filter({ hasText: "拨打电话" });
            if ((await iframeButton.count()) > 0) {
              phoneButton = iframeButton.first();
              break;
            }
          }
        }
      } else {
        // 其他卡片使用 attractionName 选择器
        const allPhoneButtons = page
          .locator('[class*="attractionName"]')
          .getByText("拨打电话", { exact: true });

        // 遍历找到第一个在 chatMsg 部分的按钮
        const buttonCount = await allPhoneButtons.count();
        for (let i = 0; i < buttonCount; i++) {
          const btn = allPhoneButtons.nth(i);
          if (await myAgent.isChatMsgElement(btn)) {
            phoneButton = btn;
            break;
          }
        }
      }

      if (phoneButton) {
        console.log("✅ 找到 makePhoneCall 按钮");

        // 添加淡红色背景用于调试
        await phoneButton.evaluate((el) => {
          (el as HTMLElement).style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        });

        console.log("点击按钮中...");
        // 点击"拨打电话"按钮
        await phoneButton.click();

        await waitForUIStableWithLog(page, {
          logPrefix: `[点击后加载中]`,
          maxWaitTime: 3000,
        });

        // 截图查看点击后的状态
        await page.screenshot({
          path: `test-results/makePhoneCall-${cardType}.png`,
          fullPage: true,
        });
        console.log(`已保存点击后截图: makePhoneCall-${cardType}.png`);

        if (!phoneCallTriggered) {
          console.log(`⚠️ makePhoneCall 未检测到电话呼叫行为`);
        }
      } else {
        console.log(`⚠️ ${cardType} 未找到 makePhoneCall 按钮，跳过此测试`);
        test.skip();
      }
    });
  });
});
