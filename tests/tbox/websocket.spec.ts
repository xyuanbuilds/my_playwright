import { test, expect, waitForUIStableWithLog } from "../fixtures";
import type { DomainsFile } from "./type";
import { loadDomains } from "./loadDomains";

// 读取 domain.json 配置文件（支持通过环境变量覆盖）
const domainsData: DomainsFile = loadDomains();

// 获取"文旅"域配置
const domains = [domainsData.domains.find((d) => d.name === "文旅")].filter(
  (d): d is NonNullable<typeof d> => Boolean(d),
);

test.describe("WebSocket 测试", () => {
  // 为每个域名创建测试
  domains.forEach((domain) => {
    if (!domain.queryUrl) {
      console.warn(
        `跳过 ${domain.name} 测试: 缺少 queryUrl 配置，无法完整测试 WebSocket`,
      );
      return;
    }

    test(`${domain.name} - 完整对话流测试`, async ({
      page,
      websocket,
      myAgent,
    }) => {
      console.log(`\n========== 开始测试: ${domain.name} ==========\n`);

      // ========== 第一部分：默认 query 验证 ==========
      console.log("\n【第一部分：默认 query 验证】\n");

      // 1. 访问页面
      console.log("[步骤 1] 访问页面");
      await page.goto(domain.queryUrl!, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      console.log("✅ 页面加载完成");

      // 2. 等待 WebSocket 初始化
      console.log("\n[步骤 2] 等待 WebSocket 初始化");
      await page.waitForTimeout(3000);

      // 3. WebSocket 监控
      console.log("\n[步骤 3] WebSocket 监控");
      let allConnections = await websocket.getAllConnections();
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

      // 4. 等待接收消息
      console.log("\n[步骤 4] 等待接收消息");
      await page.waitForTimeout(5000);

      const allMessages = await websocket.getAllMessages(
        /wss:\/\/open\.tbox\.alipay\.com\//,
      );
      console.log(`收到消息总数: ${allMessages.length}`);

      // 5. 等待第一轮对话完成（UI 稳定）
      console.log("\n[步骤 5] 等待第一轮对话完成（UI 稳定）");
      await waitForUIStableWithLog(page, {
        logPrefix: "[waitForUIStable]",
        maxWaitTime: 5000,
      });

      console.log(
        `\n✅ 默认 query 验证完成：连接数 ${wsCount}，消息数 ${allMessages.length}\n`,
      );

      // ========== 第二部分：多轮对话测试 ==========
      console.log("\n【第二部分：多轮对话测试】\n");

      // 6. 获取第一轮对话的消息统计
      console.log("[步骤 6] 第一轮对话完成，获取消息统计");
      allConnections = await websocket.getAllConnections();
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
      console.log("\n📸 截图：第一轮对话");
      await page.screenshot({
        path: test.info().outputPath(`${domain.name}-第一轮对话.png`),
        fullPage: true,
        animations: "disabled",
      });

      // 7-9. 发送第二轮消息
      const secondRoundMessage = "附近停车场";
      console.log(`\n[步骤 7-9] 发送第二轮消息`);
      await myAgent.send(secondRoundMessage);

      // 10. 等待第二轮对话完成
      console.log("\n[步骤 10] 等待第二轮对话完成");
      await waitForUIStableWithLog(page, {
        logPrefix: "[waitForUIStable]",
        maxWaitTime: 10000,
      });

      // 11. 获取第二轮对话的消息统计
      console.log("\n[步骤 11] 获取第二轮对话后的消息统计");
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

      // 12. 显示第二轮发送的消息并对比 session_id
      if (secondRoundSentCount > firstRoundSentCount) {
        console.log(`\n[步骤 12] 第二轮发送的消息:`);
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
      console.log(`\n📸 截图：第二轮对话-${secondRoundMessage}`);
      await page.screenshot({
        path: test
          .info()
          .outputPath(`${domain.name}-第二轮对话-${secondRoundMessage}.png`),
        fullPage: true,
        animations: "disabled",
      });

      // ========== 最终验证 ==========
      console.log("\n【最终验证】\n");

      // 验证默认 query
      expect(wsCount, "应该有 WebSocket 连接").toBeGreaterThan(0);
      console.log(`✅ 默认 query 验证通过`);

      // 验证多轮对话
      expect(secondRoundSentCount, "第二轮应该发送了新消息").toBeGreaterThan(
        firstRoundSentCount,
      );
      expect(
        secondRoundReceivedCount,
        "第二轮应该接收了新消息",
      ).toBeGreaterThan(firstRoundReceivedCount);
      console.log(`✅ 多轮对话验证通过`);

      console.log(`\n========== 完整测试结束: ${domain.name} ==========\n`);
    });
  });
});
