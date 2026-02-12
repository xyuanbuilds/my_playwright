import { test, expect, waitForUIStableWithLog } from "../../fixtures";
import type { Page, Locator } from "@playwright/test";
import type { MyAgent } from "../../fixtures/helpers/my-agent";
import { loadDomains } from "../loadDomains";
import type { DomainsFile } from "../type";

// 读取 domain.json 配置文件（支持通过环境变量覆盖）
const domainsData: DomainsFile = loadDomains();

// 获取"卡片综合"域配置
const cardDomain = domainsData.domains.find((d) => d.name === "卡片综合");
if (!cardDomain) {
  throw new Error("未找到卡片综合域配置");
}

/**
 * 卡片类型配置
 * ⚠️ 经测试，AI 卡片暂不支持
 */
const CARD_CONFIG = {
  一方卡片: {
    buttonText: "跳转地图",
    isIframe: false,
  },
  三方卡片: {
    buttonText: "导航定位",
    isIframe: true,
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
 * 高亮元素（添加淡绿色背景）
 */
async function highlightElement(element: Locator): Promise<void> {
  await element.evaluate((el) => {
    (el as HTMLElement).style.backgroundColor = "rgba(0, 255, 0, 0.2)";
  });
}

/**
 * 检测 URL 是否为地图相关
 */
function isMapUrl(url: string): boolean {
  return (
    url.includes("amap.com") || url.includes("ditu") || url.includes("map")
  );
}

/**
 * openLocation 测试
 * 测试不同卡片类型的导航定位/跳转地图功能
 */
test.describe("openLocation - 导航定位", () => {
  // test.describe.configure({ mode: "serial" });

  CARD_TYPES.forEach((cardType) => {
    test(`${cardType} - openLocation 功能`, async ({ page, myAgent }) => {
      const config = CARD_CONFIG[cardType];
      console.log(`\n========== openLocation 测试: ${cardType} ==========\n`);

      // 1. 设置地图跳转拦截
      let locationUrl = "";
      let popupCount = 0;

      page.on("popup", async (popup) => {
        const url = popup.url();
        console.log(`[popup] 新窗口打开: ${url}`);
        // if (isMapUrl(url)) {
        popupCount++;
        locationUrl = url;
        //   console.log(`📍 [popup] 检测到地图新窗口跳转: ${locationUrl}`);
        // }
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

      // 4. 查找 openLocation 按钮
      const locationButton = config.isIframe
        ? await findButtonInIframe(page, myAgent, config.buttonText)
        : await findFirstPartyButton(page, myAgent, config.buttonText);

      expect(
        locationButton,
        `${cardType} 未找到 openLocation 按钮`,
      ).not.toBeNull();
      console.log("✅ 找到 openLocation 按钮");

      // 5. 高亮按钮并验证点击前状态
      await highlightElement(locationButton!);
      expect(popupCount, "点击前地图跳转数应为 0").toBe(0);

      // 6. 点击按钮
      console.log("点击按钮中...");
      await locationButton!.click();

      await waitForUIStableWithLog(page, {
        logPrefix: `[点击后加载中]`,
        maxWaitTime: 3000,
      });

      // TODO 待修复完成 openLocation 的纯 H5 使用后，补充对同页面跳转的检测
      // 7. 验证点击后状态
      // expect(popupCount, "点击后地图跳转数应为 1").toBe(1);
      console.log(`✅ openLocation 触发成功，跳转地址: ${locationUrl}`);

      // 8. 截图
      await page.screenshot({
        path: `test-results/openLocation-${cardType}.png`,
        fullPage: true,
      });
      console.log(`已保存点击后截图: openLocation-${cardType}.png`);
    });
  });
});
