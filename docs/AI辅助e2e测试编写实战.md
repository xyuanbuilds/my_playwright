# AI 辅助 e2e 测试编写实战

> 基于 Claude Code Skills 和 Playwright 的测试开发最佳实践

---

## 目录

1. [项目背景与测试挑战](#第一部分项目背景与测试挑战)
2. [AI 辅助学习 Playwright](#第二部分ai-辅助学习-playwright)
3. [Skill 系统化测试开发](#第三部分skill-系统化测试开发)
4. [完整测试开发流程演示](#第四部分完整测试开发流程演示)
5. [最佳实践与经验总结](#第五部分最佳实践与经验总结)
6. [未来展望](#第六部分未来展望)

---

## 核心流程图

### AI 辅助测试开发整体流程

```mermaid
flowchart TB
    subgraph 传统方式["❌ 传统测试开发"]
        T1[阅读文档] --> T2[编写代码]
        T2 --> T3[调试问题]
        T3 --> T4[搜索解决方案]
        T4 --> T2
    end

    subgraph AI方式["✅ AI 辅助测试开发"]
        A1[描述需求] --> A2[AI 生成代码]
        A2 --> A3[AI 解释原理]
        A3 --> A4[运行验证]
        A4 --> A5{通过?}
        A5 -->|否| A6[AI 辅助调试]
        A6 --> A2
        A5 -->|是| A7[完成]
    end

    传统方式 -.->|效率提升| AI方式
```

### Skill 工作流程

```mermaid
flowchart LR
    subgraph Skills["Claude Code Skills"]
        S1[playwriter]
        S2[playwriter-video-recording]
        S3[test-driven-development]
        S4[systematic-debugging]
    end

    U[用户需求] --> C[Claude Code]
    C --> S1
    C --> S2
    C --> S3
    C --> S4

    S1 --> B1[真实浏览器控制]
    S2 --> B2[测试过程录制]
    S3 --> B3[TDD 工作流]
    S4 --> B4[系统化调试]

    B1 --> R[测试结果]
    B2 --> R
    B3 --> R
    B4 --> R
```

### 测试开发周期

```mermaid
flowchart TB
    subgraph 需求分析["1️⃣ 需求分析"]
        R1[理解测试目标]
        R2[拆解测试场景]
        R3[确定验证点]
    end

    subgraph 学习阶段["2️⃣ AI 辅助学习"]
        L1[学习相关 API]
        L2[理解最佳实践]
        L3[获取代码示例]
    end

    subgraph 开发阶段["3️⃣ 编写测试"]
        D1[创建测试结构]
        D2[实现测试逻辑]
        D3[添加断言]
    end

    subgraph 调试阶段["4️⃣ 调试优化"]
        T1[运行测试]
        T2[分析失败]
        T3[优化代码]
    end

    需求分析 --> 学习阶段
    学习阶段 --> 开发阶段
    开发阶段 --> 调试阶段
    调试阶段 -->|迭代| 开发阶段
```

---

## 第一部分：项目背景与测试挑战

### 1.1 项目介绍

本项目是一个**智能体检测平台（TBox）**的 e2e 测试框架，具有以下特点：

- 多平台支持（支付宝 H5、原生环境）
- 复杂的 bridgeAPI 交互
- 需要验证 URL 参数、API 响应、UI 渲染

```mermaid
graph TB
    subgraph 测试目标["测试目标"]
        P1[支付宝 H5]
        P2[微信小程序]
        P3[原生 WebView]
    end

    subgraph 验证内容["验证内容"]
        V1[页面可访问性]
        V2[URL 参数正确性]
        V3[API 响应格式]
        V4[UI 视觉一致性]
    end

    P1 --> V1
    P1 --> V2
    P2 --> V3
    P3 --> V4
```

### 1.2 传统测试开发的痛点

| 痛点 | 描述 | 影响 |
|------|------|------|
| 学习曲线陡峭 | Playwright API 众多，难以快速上手 | 开发效率低 |
| 编写繁琐 | 选择器、断言、等待逻辑重复 | 代码冗余 |
| 缺乏最佳实践 | 不知道如何组织测试结构 | 维护困难 |
| 调试困难 | 问题难以定位和复现 | 排查耗时 |

### 1.3 引入 AI 辅助的动机

```mermaid
mindmap
  root((AI 辅助))
    快速学习
      API 讲解
      示例代码
      原理解释
    代码生成
      样板代码
      测试用例
      Fixtures
    最佳实践
      代码结构
      错误处理
      性能优化
    问题排查
      错误分析
      调试建议
      解决方案
```

---

## 第二部分：AI 辅助学习 Playwright

### 2.1 从零开始：搭建测试环境

#### 实践对话 1：初始化项目

```
💬 你: 帮我初始化一个 Playwright 项目，支持移动端测试

🤖 AI: 我来帮你搭建：

1. 安装依赖
   pnpm install -D @playwright/test

2. 创建配置文件 playwright.config.ts
   - 配置移动设备模拟
   - 设置中文语言和时区
   - 配置报告输出

3. 创建测试目录结构
   tests/
   ├── fixtures/      # 自定义 fixtures
   ├── tbox/          # 业务测试
   └── helpers/       # 工具函数
```

#### 项目配置示例

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,

  use: {
    baseURL: process.env.BASE_URL || "https://m.alipay.com",
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 667 },
      },
    },
  ],
});
```

### 2.2 理解核心概念

#### Playwright 核心概念图

```mermaid
graph TB
    subgraph Playwright["Playwright 架构"]
        Browser[Browser 浏览器实例]
        Context[Context 浏览器上下文]
        Page[Page 页面对象]
        Locator[Locator 元素定位器]
    end

    Browser --> Context
    Context --> Page
    Page --> Locator

    subgraph 功能["核心功能"]
        F1[导航 goto]
        F2[点击 click]
        F3[输入 fill]
        F4[断言 expect]
        F5[截图 screenshot]
        F6[等待 waitFor]
    end

    Page --> F1
    Page --> F5
    Locator --> F2
    Locator --> F3
    Locator --> F4
    Page --> F6
```

#### 实践对话 2：编写第一个测试

```
💬 你: 帮我写一个测试，访问页面并截图

🤖 AI:
```

```typescript
import { test, expect } from "@playwright/test";

test("访问页面并截图", async ({ page }) => {
  // 1. 访问页面
  await page.goto("https://example.com");

  // 2. 等待页面加载
  await page.waitForLoadState("domcontentloaded");

  // 3. 等待网络空闲（可选，有些页面可能不会完全空闲）
  await page.waitForLoadState("networkidle", { timeout: 10000 })
    .catch(() => console.log("网络未完全空闲，继续执行"));

  // 4. 截图对比
  await expect(page).toHaveScreenshot("homepage.png", {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});
```

### 2.3 深入学习：自定义 Fixtures

#### Fixture 工作原理

```mermaid
sequenceDiagram
    participant Test as 测试用例
    participant Fixture as Fixture
    participant Page as Page 对象

    Test->>Fixture: 请求 urlQuery fixture
    Fixture->>Page: 获取 page 依赖
    Page-->>Fixture: 返回 page
    Fixture->>Fixture: 创建 URLQueryChecker
    Fixture-->>Test: 返回 urlQuery
    Test->>Test: 执行测试逻辑
    Note over Fixture: 测试结束后自动清理
```

#### 项目中的 Fixtures 设计

```typescript
// tests/fixtures/index.ts
import { test as base } from "@playwright/test";
import { URLQueryChecker } from "./helpers/url-query-checker";
import { ApiMonitor } from "./helpers/api-monitor";

type CustomFixtures = {
  urlQuery: URLQueryChecker;      // URL 参数验证
  apiMonitor: ApiMonitor;         // API 响应监控
  performance: PerformanceMonitor; // 性能监控
  websocket: WebSocketMonitor;     // WebSocket 监控
  platformContext: PlatformContext; // 多平台支持
  myAgent: MyAgent;                // 智能体交互
};

export const test = base.extend<CustomFixtures>({
  urlQuery: async ({ page }, use) => {
    const checker = new URLQueryChecker(page);
    await use(checker);
  },

  apiMonitor: async ({ page }, use) => {
    const monitor = new ApiMonitor(page);
    await use(monitor);
    await monitor.stop(); // 自动清理
  },
  // ...其他 fixtures
});
```

#### 实践对话 3：学习 Fixture

```
💬 你: Playwright fixture 是什么？如何创建自定义 fixture？

🤖 AI: Fixture 是 Playwright 的依赖注入机制，用于：
1. 在测试间共享设置逻辑
2. 自动管理资源生命周期
3. 提供类型安全的测试辅助工具

创建步骤：
1. 定义类型接口
2. 使用 base.extend() 扩展
3. 在 fixture 函数中创建实例
4. 通过 use() 传递给测试
5. use() 之后的代码是清理逻辑
```

---

## 第三部分：Skill 系统化测试开发

### 3.1 什么是 Skill？

```mermaid
graph LR
    subgraph "Claude Code"
        CC[Claude Code CLI]
    end

    subgraph "Skills 系统"
        S1[playwriter<br/>真实浏览器控制]
        S2[playwriter-video-recording<br/>测试录制]
        S3[test-driven-development<br/>TDD 工作流]
        S4[systematic-debugging<br/>系统化调试]
    end

    CC --> S1
    CC --> S2
    CC --> S3
    CC --> S4

    S1 --> R1[保持登录态]
    S1 --> R2[实时调试]
    S2 --> R3[生成测试视频]
    S3 --> R4[规范开发流程]
    S4 --> R5[问题根因分析]
```

### 3.2 Playwriter Skill 实战

#### Playwriter 工作原理

```mermaid
sequenceDiagram
    participant User as 用户
    participant Claude as Claude Code
    participant PW as Playwriter CLI
    participant Chrome as Chrome 浏览器

    User->>Claude: 描述测试需求
    Claude->>PW: 生成 Playwright 代码
    PW->>Chrome: 通过 CDP 连接
    Chrome-->>PW: 执行操作
    PW-->>Claude: 返回结果
    Claude-->>User: 展示结果/建议
```

#### 场景 1：真实浏览器调试

```bash
# 1. 创建新的浏览器会话
playwriter session new

# 2. 连接到会话并执行操作
playwriter -s 1 -e "await page.goto('https://example.com')"

# 3. 获取页面信息
playwriter -s 1 -e "console.log(await page.title())"

# 4. 截图
playwriter -s 1 -e "await page.screenshot({ path: './screenshot.png' })"
```

#### 场景 2：保持登录态测试

```
💬 你: 某些页面需要手动登录，如何测试？

🤖 AI: 使用 playwriter 的真实浏览器模式：

1. 启动会话：playwriter session new
2. 手动在浏览器中完成登录
3. 执行自动化测试（会话保持登录态）
4. 测试完成后关闭会话
```

### 3.3 视频录制 Skill

#### 录制流程

```mermaid
flowchart TB
    subgraph 录制过程["视频录制流程"]
        A[创建帧目录] --> B[启动定时截图<br/>5 FPS]
        B --> C[执行测试操作]
        C --> D[等待 UI 稳定]
        D --> E[停止截图]
        E --> F[ffmpeg 合成视频]
    end

    subgraph 限制["技术限制"]
        L1[CDP 连接无法使用<br/>原生 recordVideo]
        L2[VM 上下文隔离<br/>必须单次调用完成]
    end

    限制 -.->|解决方案| 录制过程
```

#### 录制代码示例

```javascript
// 单次调用完成录制
const fs = require('fs');
const path = require('path');

// 1. 创建帧目录
const videoDir = './videos';
const timestamp = Date.now();
const framesDir = path.join(videoDir, 'frames_' + timestamp);
fs.mkdirSync(framesDir, { recursive: true });

// 2. 开始定时截图 (5 FPS)
let frameIndex = 0;
let recording = true;
const captureFrame = async () => {
  if (!recording) return;
  try {
    const screenshotPath = path.join(framesDir,
      'frame_' + String(frameIndex++).padStart(5, '0') + '.png');
    await page.screenshot({ path: screenshotPath });
  } catch (e) {}
  if (recording) setTimeout(captureFrame, 200);
};
captureFrame();

// 3. 执行测试操作
await page.locator('text=按钮').click();

// 4. 等待 UI 稳定
await page.waitForTimeout(3000);

// 5. 停止录制
recording = false;
console.log('录制完成，共', frameIndex, '帧');
```

```bash
# 合成视频
ffmpeg -y -framerate 5 \
  -i ./videos/frames_*/frame_%05d.png \
  -c:v libx264 -pix_fmt yuv420p \
  ./videos/recording.mp4
```

### 3.4 TDD Skill 工作流

```mermaid
flowchart TB
    subgraph TDD["测试驱动开发"]
        T1[1. 定义测试场景] --> T2[2. 编写失败的测试]
        T2 --> T3[3. 实现功能代码]
        T3 --> T4[4. 测试通过]
        T4 --> T5[5. 重构优化]
        T5 --> T1
    end

    subgraph AI增强["AI + Skill 增强"]
        A1[分析 API Spec]
        A2[生成测试框架]
        A3[建议 Mock 策略]
        A4[生成断言逻辑]
    end

    A1 --> T1
    A2 --> T2
    A3 --> T3
    A4 --> T4
```

---

## 第四部分：完整测试开发流程演示

### 4.1 案例：为新功能编写测试

#### 需求拆解

```mermaid
mindmap
  root((卡片综合<br/>功能测试))
    基础测试
      页面可访问
      加载完成
      无 JS 错误
    URL 验证
      agent_id 存在
      user_id 存在
      channel 正确
    API 验证
      响应格式
      Schema 校验
      状态码检查
    视觉测试
      截图对比
      布局一致
      样式正确
```

#### 步骤 1：需求分析

```
💬 你: 我要测试卡片综合功能，包括页面加载、URL 参数、API 调用

🤖 AI: 让我帮你拆解任务：

1. 基础可访问性测试
   - 页面能正常打开
   - 加载状态正确
   - 无控制台错误

2. URL 参数验证测试
   - 验证必需参数存在
   - 验证参数值正确

3. API 响应验证测试
   - 监控关键 API 调用
   - 验证响应格式
   - Schema 校验

4. 视觉回归测试
   - 截图基准对比
   - 允许合理差异
```

#### 步骤 2：编写测试代码

```typescript
// tests/tbox/basic.spec.ts
import * as fs from "fs";
import * as path from "path";
import { test, expect, waitForUIStableWithLog } from "../fixtures";
import { DomainsFile } from "./type";

// 读取配置
const domainConfigPath = path.join(__dirname, "domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8"),
);

const domains = [
  domainsData.domains.find((d) => d.name === "卡片综合")
].filter((d): d is NonNullable<typeof d> => Boolean(d));

test.describe("智能体基础可访问性测试", () => {
  domains.forEach((domain) => {

    // 测试 1：访问并截图
    test(`${domain.name} - 访问并截图`, async ({ page }) => {
      await page.goto(domain.url);
      await page.waitForLoadState("domcontentloaded");

      // 等待网络空闲
      await page.waitForLoadState("networkidle", { timeout: 30000 })
        .catch(() => console.log("网络未完全空闲，继续执行"));

      // 等待 UI 稳定
      await waitForUIStableWithLog(page, {
        logPrefix: "\n[waitForUIStable]",
        maxWaitTime: 3000,
      });

      // 截图对比
      await expect(page).toHaveScreenshot(`${domain.name}-initial.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
      });
    });

    // 测试 2：URL 参数验证
    test(`${domain.name} - URL 参数验证`, async ({ urlQuery, page }) => {
      await page.goto(domain.url);

      // 验证必需参数
      await urlQuery.expectParamExists("agent_id");
      await urlQuery.expectParamExists("user_id");
      await urlQuery.expectParamExists("channel");
      await urlQuery.expectParamExists("code");

      // 验证参数值
      const userId = await urlQuery.getParam("user_id");
      await urlQuery.expectParamEquals("channel", "tbox_nologin");
      await urlQuery.expectParamEquals("code", userId!);

      console.log(`✅ ${domain.name} 域的 URL 参数验证通过`);
    });
  });
});
```

#### 步骤 3：调试优化

```
💬 你: 测试偶尔超时，如何优化？

🤖 AI: 分析可能原因并给出建议：

1. 调整等待策略
   - waitForLoadState 使用 domcontentloaded 而非 load
   - networkidle 添加 catch 容错

2. 自定义 UI 稳定检测
   - 使用 MutationObserver 监听 DOM 变化
   - 设置合理的稳定时间阈值

3. 增加容错处理
   - 关键操作添加 retry
   - 非关键等待添加 catch
```

### 4.2 数据驱动测试架构

```mermaid
graph TB
    subgraph 配置层["配置层"]
        C1[domain.json<br/>测试目标配置]
        C2[schema.json<br/>API Schema 定义]
    end

    subgraph 测试层["测试层"]
        T1[basic.spec.ts<br/>基础测试]
        T2[api.spec.ts<br/>API 测试]
        T3[visual.spec.ts<br/>视觉测试]
    end

    subgraph Fixtures层["Fixtures 层"]
        F1[urlQuery]
        F2[apiMonitor]
        F3[waitForUIStable]
    end

    C1 --> T1
    C2 --> T2
    T1 --> F1
    T2 --> F2
    T3 --> F3
```

---

## 第五部分：最佳实践与经验总结

### 5.1 AI 辅助开发的最佳实践

#### DO's ✅

```mermaid
mindmap
  root((最佳实践))
    渐进式学习
      从简单开始
      每次学一个概念
      逐步增加复杂度
    主动提问
      为什么这样写
      有没有更好方案
      原理是什么
    代码审查
      不盲目复制
      理解每一行
      结合文档验证
    善用 Skill
      playwriter 调试
      TDD 规范流程
      自定义自动化
```

#### DON'Ts ❌

| 错误做法 | 问题 | 正确做法 |
|---------|------|---------|
| 过度依赖 AI | 不理解原理，难以调试 | 理解后再使用 |
| 直接复制粘贴 | 代码不适合项目 | 根据需求调整 |
| 忽略官方文档 | 错过重要细节 | AI + 文档结合 |
| 不写注释 | 后期难以维护 | 关键逻辑加注释 |

### 5.2 项目亮点设计

#### 模块化 Fixtures 架构

```typescript
// 统一导出，使用方便
export { test, expect } from './base'
export { urlQuery } from './url-query'
export { apiMonitor } from './api-monitor'
export { waitForUIStable } from './wait-utils'

// 使用示例
import { test, expect, urlQuery, apiMonitor } from '../fixtures';

test('完整测试', async ({ page, urlQuery, apiMonitor }) => {
  // 直接使用注入的 fixtures
});
```

#### 配置驱动测试

```json
// domain.json
{
  "domains": [
    {
      "name": "卡片综合",
      "url": "https://...",
      "expectedParams": ["agent_id", "user_id"]
    },
    {
      "name": "文旅",
      "url": "https://...",
      "expectedParams": ["agent_id", "scene"]
    }
  ]
}
```

#### Schema 验证

```typescript
import { z } from 'zod';

// 定义 API 响应 Schema
const TboxAuthResponseSchema = z.object({
  hostName: z.string(),
  result: z.string(),
  success: z.boolean(),
  data: z.object({
    token: z.string().optional(),
    expireTime: z.number().optional(),
  }).optional(),
});

// 测试中使用
test('API 响应验证', async ({ apiMonitor, page }) => {
  const response = await apiMonitor.waitForResponse('/api/auth');
  const result = TboxAuthResponseSchema.safeParse(response);
  expect(result.success).toBe(true);
});
```

### 5.3 测试金字塔

```mermaid
graph TB
    subgraph 金字塔["测试金字塔"]
        E2E["E2E Tests<br/>关键路径<br/>少量"]
        INT["Integration Tests<br/>API 交互<br/>适量"]
        UNIT["Unit Tests<br/>工具函数<br/>大量"]
    end

    E2E --> |"basic.spec.ts"| INT
    INT --> |"api.spec.ts"| UNIT
    UNIT --> |"fixtures/*"| BASE[基础设施]

    style E2E fill:#ff6b6b
    style INT fill:#feca57
    style UNIT fill:#48dbfb
```

---

## 第六部分：未来展望

### 6.1 AI + 测试的未来

```mermaid
timeline
    title AI 测试发展路线

    section 现在
        AI 辅助编写 : 代码生成
                    : API 学习
                    : 问题调试

    section 近期
        智能测试生成 : 页面分析
                     : 场景推断
                     : 自动用例

    section 未来
        自主测试系统 : 自动维护
                     : 智能修复
                     : 持续演进
```

### 6.2 项目下一步计划

```mermaid
gantt
    title 项目演进计划
    dateFormat  YYYY-MM-DD

    section 测试覆盖
    bridgeAPI 测试完善    :a1, 2024-01-01, 30d
    性能测试集成          :a2, after a1, 20d

    section 工具增强
    自定义 Skill 开发     :b1, 2024-01-15, 25d
    CI/CD 集成            :b2, after b1, 15d

    section 文档沉淀
    最佳实践文档          :c1, 2024-02-01, 20d
    视频教程录制          :c2, after c1, 15d
```

### 6.3 推荐资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Playwright 官方文档 | playwright.dev | API 参考 |
| Claude Code | claude.com/claude-code | AI 辅助工具 |
| Playwriter | npm: playwriter | 浏览器控制 |
| Testing Library | testing-library.com | 测试理念 |

---

## 附录

### A. 演示准备清单

- [ ] 确保 `pnpm install` 完成
- [ ] 准备 `playwriter session new` 演示
- [ ] 准备 AI 对话截图
- [ ] 测试运行通过：`pnpm test`

### B. 常用命令

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/tbox/basic.spec.ts

# UI 模式（带可视化界面）
pnpm test --ui

# 生成测试报告
pnpm test --reporter=html

# Playwriter 会话管理
playwriter session new
playwriter session list
playwriter -s 1 -e "await page.goto('...')"
```

### C. 问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 测试超时 | 网络慢/等待策略不当 | 调整 timeout、使用 catch |
| 选择器失败 | 元素未加载/选择器错误 | 添加等待、检查选择器 |
| 截图差异 | 动态内容/动画 | 禁用动画、等待稳定 |
| API 验证失败 | Schema 变更 | 更新 Schema 定义 |

---

> 📝 本文档基于实际项目经验编写，持续更新中。
>
> 🤖 AI 辅助开发不是替代开发者，而是让开发者更高效。
