import { test, expect, waitForUIStableWithLog } from "../fixtures";
import type { DomainsFile } from "./type";
import * as fs from "fs";
import * as path from "path";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

test.describe("WebSocket 连接测试", () => {
  // 为每个域名创建测试
  domainsData.domains.forEach((domain) => {
    if (!domain.queryUrl) {
      console.warn(
        `跳过 ${domain.name} 测试: 缺少 queryUrl 配置，无法完整测试 WebSocket`,
      );
      return;
    }

    test(`${domain.name} - 默认 query`, async ({ page, websocket }) => {
      // 1. 访问页面
      console.log("\n[步骤 1] 访问页面");
      await page.goto(domain.queryUrl!, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      console.log("✅ 页面加载完成");

      // 3. 等待 WebSocket 初始化
      console.log("\n[步骤 2] 等待 WebSocket 初始化");
      await page.waitForTimeout(3000);

      // 4. WebSocket 监控
      console.log("\n[步骤 3] WebSocket 监控");
      const allConnections = await websocket.getAllConnections();
      const tboxConnections = Array.from(allConnections.entries()).filter(
        ([url]) => url.startsWith("wss://open.tbox.alipay.com/"),
      );
      const wsCount = tboxConnections.length;
      console.log(`tbox WebSocket 连接数: ${wsCount}`);

      // 验证至少有一个连接
      expect(
        wsCount,
        `${domain.name} 应该有 tbox WebSocket 连接`,
      ).toBeGreaterThan(0);

      // 打印连接报告
      await websocket.logReport();

      // 5. 等待接收消息
      console.log("\n[步骤 4] 等待接收消息");
      await page.waitForTimeout(5000);

      const allMessages = await websocket.getAllMessages(
        /wss:\/\/open\.tbox\.alipay\.com\//,
      );
      console.log(`收到消息总数: ${allMessages.length}`);
      // 验证至少收到一条消息
      expect(
        allMessages.length,
        `${domain.name} 应该至少收到一条 WebSocket 消息`,
      ).toBeGreaterThan(0);

      // 打印前 5 条消息
      console.log(`\n消息列表 (最多显示 5 条):`);
      const messagesToShow = allMessages.slice(0, 5);
      messagesToShow.forEach((msg, index) => {
        const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
        console.log(`[${index + 1}] ${msgStr.substring(0, 200)}`);
      });

      // 等待页面 UI 变动结束 5 秒再截图
      await waitForUIStableWithLog(page, {
        logPrefix: "\n[步骤 5]",
        maxWaitTime: 5000,
      });

      console.log(`\n========== 完整测试结束: ${domain.name} ==========\n`);

      // 最终断言
      expect(wsCount).toBeGreaterThan(0);
      // 消息可能为 0（连接建立后不一定立即有消息）
      console.log(`✅ 消息验证: ${allMessages.length} 条消息`);
    });

    test(`${domain.name} - 多轮对话`, async ({ page, websocket }) => {
      // 1. 访问页面
      console.log("\n[步骤 1] 访问页面");
      await page.goto(domain.queryUrl!, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      console.log("✅ 页面加载完成");

      // 2. 等待第一轮对话完成（UI 稳定）
      console.log("\n[步骤 2] 等待第一轮对话完成（UI 稳定）");
      await waitForUIStableWithLog(page, {
        logPrefix: "[waitForUIStable]",
        maxWaitTime: 5000,
      });

      // 3. 获取第一轮对话的消息统计
      console.log("\n[步骤 3] 第一轮对话完成，获取消息统计");
      let allConnections = await websocket.getAllConnections();
      let tboxConnection = Array.from(allConnections.entries()).find(([url]) =>
        url.includes("open.tbox.alipay.com"),
      );

      if (!tboxConnection) {
        throw new Error("未找到 tbox WebSocket 连接");
      }

      let [, tboxConn] = tboxConnection;
      const firstRoundSentCount = tboxConn.sentMessages.length;
      const firstRoundReceivedCount = tboxConn.messages.length;
      console.log(`第一轮 - 发送消息数: ${firstRoundSentCount}`);
      console.log(`第一轮 - 接收消息数: ${firstRoundReceivedCount}`);

      // 显示第一轮发送的消息结构
      if (firstRoundSentCount > 0) {
        console.log(`\n第一轮发送的消息:`);
        tboxConn.sentMessages.forEach((msg, index) => {
          const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
          console.log(`\n[第一轮发送 ${index + 1}]`);
          try {
            const parsed = JSON.parse(msgStr);
            console.log(JSON.stringify(parsed, null, 2));
          } catch {
            console.log(msgStr);
          }
        });
      }

      // 截图：第一轮对话完成后
      console.log("📸 截图：第一轮对话");
      await expect(page).toHaveScreenshot(`${domain.name}-第一轮对话.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });

      // 4. 查找输入框
      console.log("\n[步骤 4] 查找输入框");

      // 尝试多种选择器
      const inputSelectors = [
        'input[type="text"]',
        'input[placeholder*="输入"]',
        'input[placeholder*="问"]',
      ];

      let input = null;
      for (const selector of inputSelectors) {
        const element = page.locator(selector).first();
        const count = await element.count();
        if (count > 0 && (await element.isVisible())) {
          input = element;
          console.log(`✅ 找到输入框: ${selector}`);
          break;
        }
      }

      if (!input) {
        throw new Error("找不到输入框");
      }

      // 5. 输入第二轮消息
      const secondRoundMessage = "附近停车场";
      console.log(`\n[步骤 5] 输入'${secondRoundMessage}'`);
      await input.fill(secondRoundMessage);
      await page.waitForTimeout(500); // 等待输入完成
      console.log("✅ 输入完成");

      // 6. 发送消息（按 Enter 键）
      console.log("\n[步骤 6] 按 Enter 键发送消息");
      await input.press("Enter");
      console.log("✅ 发送消息");

      // 7. 等待第二轮对话完成
      console.log("\n[步骤 7] 等待第二轮对话完成");
      await waitForUIStableWithLog(page, {
        logPrefix: "[waitForUIStable]",
        maxWaitTime: 10000,
      });

      // 8. 获取第二轮对话的消息统计
      console.log("\n[步骤 8] 获取第二轮对话后的消息统计");
      allConnections = await websocket.getAllConnections();
      tboxConnection = Array.from(allConnections.entries()).find(([url]) =>
        url.includes("open.tbox.alipay.com"),
      );

      if (!tboxConnection) {
        throw new Error("未找到 tbox WebSocket 连接");
      }

      [, tboxConn] = tboxConnection;
      const secondRoundSentCount = tboxConn.sentMessages.length;
      const secondRoundReceivedCount = tboxConn.messages.length;
      console.log(`第二轮 - 总发送消息数: ${secondRoundSentCount}`);
      console.log(`第二轮 - 总接收消息数: ${secondRoundReceivedCount}`);
      console.log(
        `新增发送消息: ${secondRoundSentCount - firstRoundSentCount}`,
      );
      console.log(
        `新增接收消息: ${secondRoundReceivedCount - firstRoundReceivedCount}`,
      );

      // 9. 显示第二轮发送的消息并对比 session_id
      if (secondRoundSentCount > firstRoundSentCount) {
        console.log(`\n[步骤 9] 第二轮发送的消息:`);
        const newSentMessages =
          tboxConn.sentMessages.slice(firstRoundSentCount);

        // 检查第一轮是否有 session_id
        let firstRoundHasSessionId = false;
        if (firstRoundSentCount > 0) {
          try {
            const firstMsg = JSON.parse(tboxConn.sentMessages[0]);
            firstRoundHasSessionId =
              "session_id" in firstMsg || "sessionId" in firstMsg;
          } catch {}
        }

        console.log(
          `\n第一轮消息包含 session_id: ${firstRoundHasSessionId ? "✅ 是" : "❌ 否"}`,
        );

        newSentMessages.forEach((msg, index) => {
          const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
          console.log(`\n[第二轮发送 ${index + 1}]`);
          try {
            const parsed = JSON.parse(msgStr);
            console.log(JSON.stringify(parsed, null, 2));

            // 检查第二轮是否有 session_id
            const hasSessionId =
              "session_id" in parsed || "sessionId" in parsed;
            console.log(`包含 session_id: ${hasSessionId ? "✅ 是" : "❌ 否"}`);

            if (hasSessionId) {
              const sessionId = parsed.session_id || parsed.sessionId;
              console.log(`session_id 值: ${sessionId}`);
            }
          } catch {
            console.log(msgStr);
          }
        });

        console.log(`\n📊 session_id 对比结果:`);
        console.log(
          `  第一轮: ${firstRoundHasSessionId ? "有 session_id" : "无 session_id"}`,
        );
        console.log(`  第二轮: 查看上方详细输出`);
      }

      // 截图：第二轮对话完成后
      console.log(`📸 截图：第二轮对话-${secondRoundMessage}`);
      await expect(page).toHaveScreenshot(
        `${domain.name}-第二轮对话-${secondRoundMessage}.png`,
        {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
          animations: "disabled",
        },
      );

      // 断言：验证多轮对话成功
      expect(secondRoundSentCount, "第二轮应该发送了新消息").toBeGreaterThan(
        firstRoundSentCount,
      );
      expect(
        secondRoundReceivedCount,
        "第二轮应该接收了新消息",
      ).toBeGreaterThan(firstRoundReceivedCount);

      console.log(`\n✅ 多轮对话测试完成`);
    });
  });
});
