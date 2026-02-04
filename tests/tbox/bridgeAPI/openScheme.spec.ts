import { test, expect, waitForUIStableWithLog } from "../../fixtures";
import type { DomainsFile } from "../type";
import type { Page, Locator } from "@playwright/test";
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
const CARD_CONFIG = {
  一方卡片: {
    buttonTexts: ["跳转链接"],
    isIframe: false,
    expectedUrl: "https://www.baidu.com/",
  },
  三方卡片: {
    buttonTexts: ["打开链接", "跳转链接"],
    isIframe: true,
    expectedUrl:
      "https://render.antgroup.com/p/yuyan/180020010001281523/chat.html",
  },
  AI卡片: {
    buttonTexts: ["打开链接", "跳转链接"],
    isIframe: true,
    expectedUrl: "https://www.baidu.com/",
  },
} as const;

type CardType = keyof typeof CARD_CONFIG;
const CARD_TYPES = Object.keys(CARD_CONFIG) as CardType[];

/**
 * 在满足 isChatMsgElement 的元素集合中查找第一个匹配的元素
 */
async function findChatMsgElement(
  locators: Locator,
  myAgent: MyAgent,
): Promise<Locator | null> {
  const count = await locators.count();
  for (let i = 0; i < count; i++) {
    const element = locators.nth(i);
    if (await myAgent.isChatMsgElement(element)) {
      return element;
    }
  }
  return null;
}

/**
 * 在 iframe 中查找按钮（支持多个文案）
 */
async function findButtonInIframe(
  page: Page,
  myAgent: MyAgent,
  buttonTexts: readonly string[],
): Promise<Locator | null> {
  const allIframes = page.locator("iframe");
  const iframeCount = await allIframes.count();

  for (let i = 0; i < iframeCount; i++) {
    const iframe = allIframes.nth(i);
    if (await myAgent.isChatMsgElement(iframe)) {
      const frameContent = iframe.contentFrame();
      for (const buttonText of buttonTexts) {
        const iframeButton = frameContent
          .locator("button")
          .filter({ hasText: buttonText });
        if ((await iframeButton.count()) > 0) {
          return iframeButton.first();
        }
      }
    }
  }
  return null;
}

/**
 * 在页面中查找一方卡片按钮
 */
async function findFirstPartyButton(
  page: Page,
  myAgent: MyAgent,
  buttonText: string,
): Promise<Locator | null> {
  const allButtons = page
    .locator('[class*="attractionName"]')
    .getByText(buttonText, { exact: true });

  return findChatMsgElement(allButtons, myAgent);
}

/**
 * 高亮元素（添加淡蓝色背景）
 */
async function highlightElement(element: Locator): Promise<void> {
  await element.evaluate((el) => {
    (el as HTMLElement).style.backgroundColor = "rgba(0, 0, 255, 0.2)";
  });
}

/**
 * openScheme 测试
 * 测试不同卡片类型的打开链接/跳转功能
 */
test.describe("openScheme - 打开链接", () => {
  test.describe.configure({ mode: "serial" });

  CARD_TYPES.forEach((cardType) => {
    test(`${cardType} - openScheme 功能`, async ({ page, myAgent }) => {
      const config = CARD_CONFIG[cardType];
      console.log(`\n========== openScheme 测试: ${cardType} ==========\n`);

      // 1. 设置链接跳转拦截
      let schemeUrl = "";
      let popupCount = 0;

      page.on("popup", async (popup) => {
        const url = popup.url();
        popupCount++;
        schemeUrl = url;
        console.log(`🔗 [popup] 检测到新窗口跳转: ${schemeUrl}`);
        await popup.pause();
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

      // 3. 点击对应卡片类型
      await page
        .locator('[class*="welcome-cards"]')
        .getByText(cardType)
        .click();

      await waitForUIStableWithLog(page, {
        logPrefix: `[${cardType}加载]`,
        maxWaitTime: 10000,
      });

      // 4. 查找 openScheme 按钮
      const schemeButton = config.isIframe
        ? await findButtonInIframe(page, myAgent, config.buttonTexts)
        : await findFirstPartyButton(page, myAgent, config.buttonTexts[0]);

      expect(schemeButton, `${cardType} 未找到 openScheme 按钮`).not.toBeNull();
      console.log("✅ 找到 openScheme 按钮");

      // 5. 高亮按钮并验证点击前状态
      await highlightElement(schemeButton!);
      expect(popupCount, "点击前 popup 触发数应为 0").toBe(0);

      // 6. 点击按钮
      console.log("点击按钮中...");
      await schemeButton!.click();

      await waitForUIStableWithLog(page, {
        logPrefix: `[点击后加载中]`,
        maxWaitTime: 3000,
      });

      // 7. 验证点击后状态
      expect(popupCount, "点击后 popup 触发数应为 1").toBe(1);
      expect(schemeUrl, `跳转链接应为 ${config.expectedUrl}`).toBe(
        config.expectedUrl,
      );
      console.log(`✅ openScheme 触发成功，跳转链接: ${schemeUrl}`);

      // 8. 截图
      await page.screenshot({
        path: `test-results/openScheme-${cardType}.png`,
        fullPage: true,
      });
      console.log(`已保存点击后截图: openScheme-${cardType}.png`);
    });
  });
});
