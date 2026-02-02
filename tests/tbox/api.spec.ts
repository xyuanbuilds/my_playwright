import { test, expect } from "../fixtures";
import type { DomainsFile } from "./type";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

/**
 * API 响应测试
 * 监控和验证 HTTP API 请求/响应
 */
test.describe("API 响应验证测试", () => {
  domainsData.domains.forEach((domain) => {
    // test(`${domain.name} - 基础 API 验证`, async ({ page, apiMonitor }) => {
    //   console.log(`\n========== 测试域: ${domain.name} ==========`);

    //   // 配置要监听的 API
    //   await apiMonitor.track([
    //     {
    //       name: "tbox-prod",
    //       urlPattern: "open.tbox.alipay.com",
    //       successStatusCodes: [200, 201],
    //       maxResponseTime: 3000,
    //     },
    //   ]);

    //   // 访问页面
    //   console.log(`访问 URL: ${domain.url}`);
    //   await page.goto(domain.url, {
    //     waitUntil: "domcontentloaded",
    //     timeout: 60000,
    //   });

    //   // 等待网络请求完成
    //   await page
    //     .waitForLoadState("networkidle", { timeout: 30000 })
    //     .catch(() => {
    //       console.log("网络未完全空闲，继续执行测试");
    //     });

    //   // 等待一段时间确保所有 API 调用完成
    //   await page.waitForTimeout(3000);

    //   // 打印 API 报告
    //   await apiMonitor.getReport();

    //   // 验证被 track 的 API 是否被调用
    //   const tboxCalls = apiMonitor.getApiCalls("tbox-prod");
    //   console.log(`\ntbox-prod API 调用数: ${tboxCalls.length}`);

    //   // 基础断言：至少应该有一些被 track 的 API 调用
    //   expect(
    //     tboxCalls.length,
    //     "应该至少有一个 tbox-prod API 调用"
    //   ).toBeGreaterThan(0);

    //   // 使用 validate() 验证所有被 track 的 API
    //   await apiMonitor.validate();

    //   console.log(`\n✅ ${domain.name} API 基础验证通过`);
    // });

    // test(`${domain.name} - 响应时间验证`, async ({ page, apiMonitor }) => {
    //   console.log(`\n========== 测试域: ${domain.name} - 响应时间 ==========`);

    //   // 开始监控，设置响应时间阈值
    //   await apiMonitor.start({
    //     maxResponseTime: 5000,
    //     trackResponseBody: true,
    //   });

    //   await page.goto(domain.url, {
    //     waitUntil: "domcontentloaded",
    //     timeout: 60000,
    //   });

    //   // 等待一段时间让 API 调用完成
    //   await page.waitForTimeout(3000).catch(() => {
    //     console.log("等待超时，继续执行测试");
    //   });

    //   const allCalls = apiMonitor.getAllCalls();

    //   // 统计响应时间
    //   const slowCalls = allCalls.filter((call) => call.duration > 5000);
    //   const avgDuration =
    //     allCalls.length > 0
    //       ? allCalls.reduce((sum, call) => sum + call.duration, 0) /
    //         allCalls.length
    //       : 0;

    //   console.log(`\n响应时间统计:`);
    //   console.log(`  总调用数: ${allCalls.length}`);
    //   console.log(`  平均响应时间: ${avgDuration.toFixed(2)}ms`);
    //   console.log(`  慢请求数 (>5s): ${slowCalls.length}`);

    //   if (slowCalls.length > 0) {
    //     console.log(`\n慢请求详情:`);
    //     slowCalls.forEach((call) => {
    //       console.log(`  - [${call.method}] ${call.url}: ${call.duration}ms`);
    //     });
    //   }

    //   // 断言：大部分请求应该在合理时间内完成
    //   const slowCallRatio =
    //     allCalls.length > 0 ? slowCalls.length / allCalls.length : 0;
    //   expect(
    //     slowCallRatio,
    //     `慢请求占比应该小于 20% (当前: ${(slowCallRatio * 100).toFixed(1)}%)`,
    //   ).toBeLessThan(0.2);

    //   console.log(`\n✅ ${domain.name} 响应时间验证通过`);
    // });

    // if (domain.queryUrl) {
    //   test(`${domain.name} - 带 Query 参数的 API 验证`, async ({
    //     page,
    //     apiMonitor,
    //   }) => {
    //     console.log(
    //       `\n========== 测试域: ${domain.name} - Query 参数 API ==========`,
    //     );

    //     // 定义要监听的 API，带 schema 验证
    //     const TboxResponseSchema = z.object({
    //       code: z.number().or(z.string()).optional(),
    //       data: z.any().optional(),
    //       success: z.boolean().optional(),
    //       message: z.string().optional(),
    //     });

    //     await apiMonitor.track([
    //       {
    //         name: "tbox-with-query",
    //         urlPattern: { contains: "tbox.alipay.com" },
    //         successStatusCodes: [200],
    //         maxResponseTime: 5000,
    //         responseSchema: TboxResponseSchema,
    //         responseValidator: (body) => {
    //           // 自定义验证：确保响应不为空
    //           return body !== null && body !== undefined;
    //         },
    //       },
    //     ]);

    //     await page.goto(domain.queryUrl, {
    //       waitUntil: "domcontentloaded",
    //       timeout: 60000,
    //     });

    //     await page.waitForTimeout(5000);

    //     // 验证特定 API
    //     const tboxCalls = apiMonitor.getApiCalls("tbox-with-query");
    //     console.log(`\ntbox API 调用次数: ${tboxCalls.length}`);

    //     if (tboxCalls.length > 0) {
    //       // 显示第一个调用的详情
    //       const firstCall = tboxCalls[0];
    //       console.log(`\n第一个 tbox API 调用详情:`);
    //       console.log(`  URL: ${firstCall.url}`);
    //       console.log(`  状态: ${firstCall.status}`);
    //       console.log(`  耗时: ${firstCall.duration}ms`);

    //       if (firstCall.responseBody) {
    //         console.log(
    //           `  响应体预览: ${JSON.stringify(firstCall.responseBody).substring(0, 200)}...`,
    //         );
    //       }

    //       // 检查验证错误
    //       if (firstCall.validationErrors) {
    //         console.log(
    //           `  ⚠️  验证错误: ${firstCall.validationErrors.join("; ")}`,
    //         );
    //       }
    //     }

    //     // 使用 validate() 方法验证所有追踪的 API
    //     await apiMonitor.validate();

    //     await apiMonitor.getReport();

    //     console.log(`\n✅ ${domain.name} Query 参数 API 验证通过`);
    //   });
    // }

    test(`${domain.name} - JSON 格式验证`, async ({ page, apiMonitor }) => {
      console.log(`\n========== 测试域: ${domain.name} - JSON 格式 ==========`);

      await apiMonitor.start({
        validateJSON: true,
        trackResponseBody: true,
      });

      await page.goto(domain.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page
        .waitForLoadState("networkidle", { timeout: 30000 })
        .catch(() => {
          console.log("网络未完全空闲，继续执行测试");
        });

      await page.waitForTimeout(2000);

      const allCalls = apiMonitor.getAllCalls();
      const jsonCalls = allCalls.filter((call) =>
        call.contentType?.includes("application/json"),
      );

      console.log(`\nJSON API 统计:`);
      console.log(`  总 API 调用: ${allCalls.length}`);
      console.log(`  JSON API 调用: ${jsonCalls.length}`);

      // 验证 JSON 响应格式
      const invalidJsonCalls = jsonCalls.filter((call) => {
        // 如果没有响应体，跳过（可能是缓存资源或被清理的资源）
        if (!call.responseBody) return false;

        // 忽略 JSONP 请求（URL 中包含 callback 参数）
        if (call.url.includes("callback=")) return false;

        // 如果 responseBody 是字符串，说明 JSON 解析失败
        // 如果是对象或数组，说明 JSON 解析成功
        return typeof call.responseBody === "string";
      });

      console.log(`  无效 JSON 响应: ${invalidJsonCalls.length}`);

      if (invalidJsonCalls.length > 0) {
        console.log(`\n⚠️  发现无效的 JSON 响应:`);
        invalidJsonCalls.forEach((call) => {
          console.log(`  - ${call.url}`);
        });
      }

      expect(
        invalidJsonCalls.length,
        "所有 JSON API 应该返回有效的 JSON 格式",
      ).toBe(0);

      console.log(`\n✅ ${domain.name} JSON 格式验证通过`);
    });
  });
});
