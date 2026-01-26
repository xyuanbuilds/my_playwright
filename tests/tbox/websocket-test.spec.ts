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

    test(`完整测试 ${domain.name} - 默认 query`, async ({
      page,
      websocket,
    }) => {
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
  });
});
