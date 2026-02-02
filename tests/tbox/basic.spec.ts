import * as fs from "fs";
import * as path from "path";
import {
  test,
  expect,
  waitForUIStable,
  waitForUIStableWithLog,
} from "../fixtures";
import { DomainsFile } from "./type";

// 读取 domain.json 配置文件
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);
const { domains } = domainsData;

/**
 * 基础的智能体测试示例
 */
test.describe("智能体基础测试", () => {
  domains.forEach((domain) => {
    test(`访问并截图 - ${domain.name}`, async ({ page }) => {
      console.log(`测试域: ${domain?.name}`);
      console.log(`URL: ${domain.url}`);

      // 访问文旅页面
      await page.goto(domain.url);

      // 等待页面基本加载完成
      await page.waitForLoadState("domcontentloaded");

      // 等待网络请求基本完成
      await page
        .waitForLoadState("networkidle", { timeout: 30000 })
        .catch(() => {
          console.log("网络未完全空闲，继续执行测试");
        });

      // 等待页面 UI 变动结束 3 秒再截图
      await waitForUIStableWithLog(page, {
        logPrefix: "\n[waitForUIStable]",
        maxWaitTime: 3000,
      });

      // 截图记录初始状态
      // await page.screenshot({
      //   path: `screenshots/tbox/${domain.name}-initial.png`,
      //   fullPage: true,
      // });

      // 使用 toHaveScreenshot 做基准比对（首次会生成基准）
      await expect(page).toHaveScreenshot(`${domain.name}-initial.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02, // 允许 2% 像素差异
        animations: "disabled",
      });

      console.log("页面加载完成");
    });

    test(`URL 参数验证 - ${domain.name}`, async ({ urlQuery, page }) => {
      // 访问文旅页面
      await page.goto(domain.url);

      // 验证必需参数存在
      await urlQuery.expectParamExists("agent_id");
      await urlQuery.expectParamExists("user_id");
      await urlQuery.expectParamExists("channel");
      await urlQuery.expectParamExists("code");
      const useId = await urlQuery.getParam("user_id");

      // 验证参数值
      await urlQuery.expectParamEquals("channel", "tbox_nologin");
      await urlQuery.expectParamEquals("code", useId!);

      console.log(`✅ ${domain.name} 域的 URL 参数验证通过`);
    });
  });
});
