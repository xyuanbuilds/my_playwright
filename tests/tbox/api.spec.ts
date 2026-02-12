import { test, expect } from "../fixtures";
import type { DomainsFile } from "./type";
import { z } from "zod";
import { loadDomains } from "./loadDomains";

// 读取 domain.json 配置文件（支持通过环境变量覆盖）
const domainsData: DomainsFile = loadDomains();

// 获取"文旅"域配置
const domains = [domainsData.domains.find((d) => d.name === "文旅")].filter(
  (d): d is NonNullable<typeof d> => Boolean(d),
);

/**
 * tbox-auth 接口响应 Schema
 */
const TboxAuthResponseSchema = z.object({
  hostName: z.string(),
  result: z.string(), // token 字符串
  success: z.boolean(),
  traceId: z.string(),
});

/**
 * tbox-homepage 接口响应 Schema
 */
const TboxHomepageResponseSchema = z.object({
  hostName: z.string(),
  result: z.object({
    agentAvatar: z.string(),
    background: z.record(z.string(), z.any()).optional(),
    chatFileEnable: z.boolean(),
    homepageUserInfo: z.object({
      speakerFlag: z.string().optional(),
    }),
    imgQueryEnabled: z.string(),
    inputPlaceHolder: z.string(),
    prologue: z.array(
      z.object({
        blockData: z.string(),
        pluginId: z.string(),
        rowType: z.string(),
      }),
    ),
    searchEngineSwitch: z.boolean(),
    toolbarIpConfig: z.record(z.string(), z.any()).optional(),
  }),
  success: z.boolean(),
  traceId: z.string(),
});

/**
 * API 响应测试
 * 监控和验证 HTTP API 请求/响应
 */
test.describe("API 响应验证测试", () => {
  domains.forEach((domain) => {
    test(`${domain.name} - 基础 API 验证`, async ({ page, apiMonitor }) => {
      console.log(`\n========== 测试域: ${domain.name} ==========`);

      // 配置要监听的 API，仅监听特定接口，并添加 schema 验证
      await apiMonitor.track(
        [
          {
            name: "tbox-auth",
            urlPattern: "open.tbox.alipay.com/agent/auth",
            successStatusCodes: [200, 201],
            maxResponseTime: 3000,
            responseSchema: TboxAuthResponseSchema,
          },
          {
            name: "tbox-homepage",
            urlPattern: "open.tbox.alipay.com/agent/v1/homepage/get",
            successStatusCodes: [200, 201],
            maxResponseTime: 3000,
            responseSchema: TboxHomepageResponseSchema,
          },
        ],
        { trackResponseBody: true },
      );

      // 访问页面
      console.log(`访问 URL: ${domain.url}`);
      await page.goto(domain.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // 等待网络请求完成
      // await page
      //   .waitForLoadState("networkidle", { timeout: 30000 })
      //   .catch(() => {
      //     console.log("网络未完全空闲，继续执行测试");
      //   });

      // 等待一段时间确保所有 API 调用完成
      await page.waitForTimeout(5000);

      // 打印 API 报告
      await apiMonitor.getReport();

      // 验证被 track 的 API 是否被调用
      const authCalls = apiMonitor.getApiCalls("tbox-auth");
      const homepageCalls = apiMonitor.getApiCalls("tbox-homepage");
      console.log(`\ntbox-auth API 调用数: ${authCalls.length}`);
      console.log(`tbox-homepage API 调用数: ${homepageCalls.length}`);

      // 基础断言：至少应该有一些被 track 的 API 调用
      const totalCalls = authCalls.length + homepageCalls.length;
      expect(totalCalls, "应该至少有一个 tbox API 调用").toBeGreaterThan(0);

      // 使用 validate() 验证所有被 track 的 API
      await apiMonitor.validate();

      // 记录无效 JSON 响应（仅记录，不断言）
      const allCalls = apiMonitor.getAllCalls();
      const jsonCalls = allCalls.filter((call) =>
        call.contentType?.includes("application/json"),
      );
      const invalidJsonCalls = jsonCalls.filter((call) => {
        if (!call.responseBody) return false;
        if (call.url.includes("callback=")) return false;
        return typeof call.responseBody === "string";
      });

      if (invalidJsonCalls.length > 0) {
        console.log(`\n⚠️ 发现 ${invalidJsonCalls.length} 个无效 JSON 响应:`);
        invalidJsonCalls.forEach((call) => {
          console.log(`  - ${call.url}`);
        });
      }

      console.log(`\n✅ ${domain.name} API 基础验证通过`);
    });
  });
});
