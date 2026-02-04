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
    buttonText: "发送消息",
    isIframe: false,
    expectedMessage: "111",
  },
  三方卡片: {
    buttonText: "发送查询",
    isIframe: true,
    expectedMessage: "你好",
  },
  AI卡片: {
    buttonText: "发送消息",
    isIframe: true,
    expectedMessage: "111",
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
 * 在 iframe 中查找按钮
 */
async function findButtonInIframe(
  page: Page,
  myAgent: MyAgent,
  buttonText: string,
): Promise<Locator | null> {
  const allIframes = page.locator("iframe");
  const iframeCount = await allIframes.count();

  for (let i = 0; i < iframeCount; i++) {
    const iframe = allIframes.nth(i);
    if (await myAgent.isChatMsgElement(iframe)) {
      const frameContent = iframe.contentFrame();
      const iframeButton = frameContent
        .locator("button")
        .filter({ hasText: buttonText });
      if ((await iframeButton.count()) > 0) {
        return iframeButton.first();
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
 * 在 msgWrapper 中查找期望的消息文本
 */
async function findExpectedMessage(
  page: Page,
  myAgent: MyAgent,
  expectedText: string,
): Promise<Locator | null> {
  const allMsgWrappers = page.locator('[class*="msgWrapper"]');
  const wrapperCount = await allMsgWrappers.count();

  for (let i = 0; i < wrapperCount; i++) {
    const wrapper = allMsgWrappers.nth(i);
    if (await myAgent.isChatMsgElement(wrapper)) {
      const message = wrapper.getByText(expectedText);
      if ((await message.count()) > 0) {
        return message.first();
      }
    }
  }
  return null;
}

/**
 * 高亮元素（添加淡黄色背景）
 */
async function highlightElement(element: Locator): Promise<void> {
  await element.evaluate((el) => {
    (el as HTMLElement).style.backgroundColor = "rgba(255, 255, 0, 0.3)";
  });
}

/**
 * sendQuery 测试
 * 测试不同卡片类型的发送消息功能
 */
test.describe("sendQuery - 发送消息", () => {
  test.describe.configure({ mode: "serial" });

  CARD_TYPES.forEach((cardType) => {
    test(`${cardType} - sendQuery 功能`, async ({ page, myAgent }) => {
      const config = CARD_CONFIG[cardType];
      console.log(`\n========== sendQuery 测试: ${cardType} ==========\n`);

      // 1. 访问页面
      await page.goto(cardDomain.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await waitForUIStableWithLog(page, {
        logPrefix: `[首页卡加载]`,
        maxWaitTime: 1000,
      });

      // 2. 点击对应卡片类型
      await page
        .locator('[class*="welcome-cards"]')
        .getByText(cardType)
        .click();

      await waitForUIStableWithLog(page, {
        logPrefix: `[${cardType}加载]`,
        maxWaitTime: 10000,
      });

      // 3. 查找 sendQuery 按钮
      const queryButton = config.isIframe
        ? await findButtonInIframe(page, myAgent, config.buttonText)
        : await findFirstPartyButton(page, myAgent, config.buttonText);

      expect(queryButton, `${cardType} 未找到 sendQuery 按钮`).not.toBeNull();
      console.log("✅ 找到 sendQuery 按钮");

      // 4. 高亮并点击按钮
      await highlightElement(queryButton!);
      console.log("点击按钮中...");
      await queryButton!.click();

      // 5. 等待消息发送和响应
      await waitForUIStableWithLog(page, {
        logPrefix: `[发送消息后]`,
        maxWaitTime: 10000,
      });

      // 6. 验证消息是否发送成功
      const messageElement = await findExpectedMessage(
        page,
        myAgent,
        config.expectedMessage,
      );

      expect(
        messageElement,
        `应在 chatMsg 的 msgWrapper 中找到 '${config.expectedMessage}' 文本`,
      ).not.toBeNull();

      await highlightElement(messageElement!);
      await expect(
        messageElement!,
        `msgWrapper 中应包含 '${config.expectedMessage}' 文本`,
      ).toBeVisible();
      console.log(
        `✅ sendQuery 触发成功，msgWrapper 中找到 '${config.expectedMessage}' 文本`,
      );

      // 7. 截图
      await page.screenshot({
        path: `test-results/sendQuery-${cardType}.png`,
        fullPage: true,
      });
      console.log(`已保存点击后截图: sendQuery-${cardType}.png`);
    });
  });
});
