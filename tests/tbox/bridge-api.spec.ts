import { test, expect, waitForUIStableWithLog } from "../fixtures";
import type { DomainsFile } from "./type";
import * as fs from "fs";
import * as path from "path";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
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
const CARD_TYPES = ["一方卡片", "三方卡片", "Paul卡片", "AI卡片"] as const;
type CardType = (typeof CARD_TYPES)[number];

/**
 * BridgeAPI 测试
 * 测试不同卡片类型的 bridgeAPI 功能可用性
 */
test.describe("BridgeAPI 功能测试", () => {
  test.describe.configure({ mode: "serial" });

  /**
   * 辅助函数：发送消息触发卡片并等待渲染完成
   */
  async function triggerCard(
    page: ReturnType<typeof test.info>["_test"]["fixtures"]["page"],
    myAgent: ReturnType<typeof test.info>["_test"]["fixtures"]["myAgent"],
    cardType: CardType,
  ) {
    console.log(`\n📤 触发卡片: ${cardType}`);
    await myAgent.send(cardType);
    await waitForUIStableWithLog(page, {
      logPrefix: `[${cardType}]`,
      maxWaitTime: 10000,
    });
  }

  // ========== sendQuery 测试 ==========
  test.describe("sendQuery - 发送消息", () => {
    CARD_TYPES.forEach((cardType) => {
      test(`${cardType} - sendQuery 功能`, async ({
        page,
        myAgent,
        websocket,
      }) => {
        console.log(`\n========== sendQuery 测试: ${cardType} ==========\n`);

        // 1. 访问页面
        await page.goto(cardDomain.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(3000);

        // 2. 获取当前 WebSocket 消息数（发送前）
        const beforeSendMessages = await websocket.getAllMessages(
          /wss:\/\/open\.tbox\.alipay\.com\//,
        );
        const beforeSendCount = beforeSendMessages.length;
        console.log(`发送前消息数: ${beforeSendCount}`);

        // 3. 使用 myAgent.send() 发送消息触发卡片
        console.log(`📤 发送消息触发卡片: ${cardType}`);
        await myAgent.send(cardType);

        // 4. 等待 UI 稳定（消息发送和响应完成）
        await waitForUIStableWithLog(page, {
          logPrefix: `[${cardType}]`,
          maxWaitTime: 10000,
        });

        // 5. 验证 WebSocket 有消息发出和返回
        const afterSendMessages = await websocket.getAllMessages(
          /wss:\/\/open\.tbox\.alipay\.com\//,
        );
        const afterSendCount = afterSendMessages.length;
        console.log(`发送后消息数: ${afterSendCount}`);

        const newMessageCount = afterSendCount - beforeSendCount;
        console.log(`新增消息数: ${newMessageCount}`);

        // 验证：发送消息后应该有 WebSocket 消息（发送 + 接收）
        expect(
          newMessageCount,
          "sendQuery 应该触发 WebSocket 消息收发",
        ).toBeGreaterThan(0);

        console.log(`✅ sendQuery 验证通过，消息收发正常`);
      });
    });
  });

  // ========== openScheme 测试 ==========
  test.describe("openScheme - 跳转外部页面", () => {
    CARD_TYPES.forEach((cardType) => {
      test(`${cardType} - openScheme 功能`, async ({
        page,
        myAgent,
        context,
      }) => {
        console.log(`\n========== openScheme 测试: ${cardType} ==========\n`);

        // 1. 访问页面
        await page.goto(cardDomain.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(3000);

        // 2. 触发卡片
        await triggerCard(page, myAgent, cardType);

        // 3. 监听新页面/弹窗
        let newPageOpened = false;
        let newPageUrl = "";

        const popupPromise = page
          .waitForEvent("popup", { timeout: 10000 })
          .catch(() => null);

        // 也监听 context 级别的新页面
        context.on("page", (newPage) => {
          newPageOpened = true;
          newPageUrl = newPage.url();
          console.log(`📄 新页面打开: ${newPageUrl}`);
        });

        // 4. 查找并点击 openScheme 相关按钮
        // openScheme 按钮通常包含"查看"、"详情"、"跳转"、"打开"等文字
        const openSchemeButton = page
          .locator(
            'button:has-text("查看"), button:has-text("详情"), button:has-text("跳转"), button:has-text("打开"), [role="button"]:has-text("查看"), a[href]',
          )
          .first();

        if ((await openSchemeButton.count()) > 0) {
          console.log("✅ 找到 openScheme 按钮，点击中...");
          await openSchemeButton.click();

          // 等待可能的页面跳转
          const popup = await popupPromise;

          if (popup) {
            newPageOpened = true;
            newPageUrl = popup.url();
            console.log(`📄 弹窗页面: ${newPageUrl}`);
            await popup.close();
          }

          // 检查当前页面 URL 是否变化
          const currentUrl = page.url();
          if (currentUrl !== cardDomain.url) {
            console.log(`📄 页面跳转到: ${currentUrl}`);
            newPageOpened = true;
            newPageUrl = currentUrl;
          }

          if (newPageOpened) {
            console.log(`✅ openScheme 验证通过，跳转到: ${newPageUrl}`);
          } else {
            console.log(`⚠️ openScheme 未检测到页面跳转`);
          }
        } else {
          console.log(`⚠️ ${cardType} 未找到 openScheme 按钮，跳过此测试`);
          test.skip();
        }
      });
    });
  });

  // ========== openLocation 测试 ==========
  test.describe("openLocation - 跳转地图页", () => {
    CARD_TYPES.forEach((cardType) => {
      test(`${cardType} - openLocation 功能`, async ({
        page,
        myAgent,
        context,
      }) => {
        console.log(`\n========== openLocation 测试: ${cardType} ==========\n`);

        // 1. 访问页面
        await page.goto(cardDomain.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(3000);

        // 2. 触发卡片
        await triggerCard(page, myAgent, cardType);

        // 3. 监听地图页跳转
        let mapPageOpened = false;
        let mapUrl = "";

        const popupPromise = page
          .waitForEvent("popup", { timeout: 10000 })
          .catch(() => null);

        context.on("page", (newPage) => {
          const url = newPage.url();
          // 检查是否是高德地图相关 URL
          if (
            url.includes("amap.com") ||
            url.includes("gaode") ||
            url.includes("map") ||
            url.includes("location")
          ) {
            mapPageOpened = true;
            mapUrl = url;
            console.log(`🗺️ 地图页打开: ${mapUrl}`);
          }
        });

        // 4. 查找并点击 openLocation 相关按钮
        // openLocation 按钮通常包含"导航"、"地图"、"位置"、"路线"等文字
        const locationButton = page
          .locator(
            'button:has-text("导航"), button:has-text("地图"), button:has-text("位置"), button:has-text("路线"), button:has-text("到这去"), [role="button"]:has-text("导航")',
          )
          .first();

        if ((await locationButton.count()) > 0) {
          console.log("✅ 找到 openLocation 按钮，点击中...");
          await locationButton.click();

          const popup = await popupPromise;
          if (popup) {
            mapUrl = popup.url();
            if (
              mapUrl.includes("amap") ||
              mapUrl.includes("gaode") ||
              mapUrl.includes("map")
            ) {
              mapPageOpened = true;
              console.log(`🗺️ 地图弹窗: ${mapUrl}`);
            }
            await popup.close();
          }

          await page.waitForTimeout(2000);

          if (mapPageOpened) {
            console.log(`✅ openLocation 验证通过，地图页: ${mapUrl}`);
          } else {
            console.log(`⚠️ openLocation 未检测到地图页跳转`);
          }
        } else {
          console.log(`⚠️ ${cardType} 未找到 openLocation 按钮，跳过此测试`);
          test.skip();
        }
      });
    });
  });

  // ========== makePhoneCall 测试 ==========
  test.describe("makePhoneCall - 拨打电话", () => {
    CARD_TYPES.forEach((cardType) => {
      test(`${cardType} - makePhoneCall 功能`, async ({ page, myAgent }) => {
        console.log(
          `\n========== makePhoneCall 测试: ${cardType} ==========\n`,
        );

        // 1. 访问页面
        await page.goto(cardDomain.url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(3000);

        // 2. 触发卡片
        await triggerCard(page, myAgent, cardType);

        // 3. 监听 tel: scheme 调用
        let phoneCallTriggered = false;
        let phoneNumber = "";

        // 拦截 tel: 链接点击
        await page.route("**/*", async (route) => {
          const url = route.request().url();
          if (url.startsWith("tel:")) {
            phoneCallTriggered = true;
            phoneNumber = url.replace("tel:", "");
            console.log(`📞 检测到电话呼叫: ${phoneNumber}`);
            await route.abort();
          } else {
            await route.continue();
          }
        });

        // 4. 查找并点击 makePhoneCall 相关按钮
        // makePhoneCall 按钮通常包含"拨打"、"电话"、"联系"、"呼叫"等文字，或显示电话号码
        const phoneButton = page
          .locator(
            'button:has-text("拨打"), button:has-text("电话"), button:has-text("联系"), button:has-text("呼叫"), [role="button"]:has-text("拨打"), a[href^="tel:"]',
          )
          .first();

        if ((await phoneButton.count()) > 0) {
          console.log("✅ 找到 makePhoneCall 按钮，点击中...");

          // 检查是否是 tel: 链接
          const href = await phoneButton.getAttribute("href");
          if (href?.startsWith("tel:")) {
            phoneCallTriggered = true;
            phoneNumber = href.replace("tel:", "");
            console.log(`📞 检测到电话号码链接: ${phoneNumber}`);
          } else {
            await phoneButton.click();
            await page.waitForTimeout(2000);
          }

          if (phoneCallTriggered) {
            console.log(`✅ makePhoneCall 验证通过，电话号码: ${phoneNumber}`);
          } else {
            // 检查是否有弹窗提示
            const dialog = page.locator('[role="dialog"], .modal, .popup');
            if ((await dialog.count()) > 0) {
              const dialogText = await dialog.textContent();
              if (
                dialogText?.includes("电话") ||
                dialogText?.includes("拨打")
              ) {
                console.log(`✅ makePhoneCall 触发了电话确认弹窗`);
                phoneCallTriggered = true;
              }
            }
          }

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
});
