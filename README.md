# Playwright H5 测试环境

基于 Playwright 的 H5 移动端自动化测试环境，适用于支付宝小程序对应的 H5 页面测试。

## 安装

```bash
# 安装依赖
pnpm install

# 安装浏览器（如果还没安装）
pnpm exec playwright install chromium
```

## 使用方法

### 运行测试

```bash
# 运行所有测试（无头模式）
pnpm test

# 使用 UI 模式运行测试（推荐）
pnpm test:ui

# 有头模式运行测试（可以看到浏览器）
pnpm test:headed

# 只运行移动端 Chrome 测试
pnpm test:mobile

# 调试模式
pnpm test:debug

# 查看测试报告
pnpm test:report
```

### 代码生成器

Playwright 提供了代码生成工具，可以通过录制操作自动生成测试代码：

```bash
# 启动代码生成器
pnpm test:codegen

# 针对特定 URL 生成代码
pnpm test:codegen https://m.alipay.com
```

## 目录结构

```
.
├── tests/                    # 测试文件目录
│   ├── example.spec.ts      # 基础示例测试
│   └── h5-app.spec.ts       # H5 应用场景测试
├── screenshots/             # 截图输出目录
├── playwright-report/       # 测试报告目录
├── playwright.config.ts     # Playwright 配置文件
└── package.json
```

## 配置说明

### playwright.config.ts

主要配置项：

- `testDir`: 测试文件目录（默认：`./tests`）
- `timeout`: 每个测试的超时时间（默认：30秒）
- `baseURL`: 基础 URL，可通过环境变量 `BASE_URL` 配置
- `projects`: 配置了多个测试项目：
  - Mobile Chrome (375x667)
  - Mobile Safari (390x844)
  - Desktop Chrome

### 环境变量

创建 `.env` 文件来配置环境变量：

```bash
# 基础 URL
BASE_URL=https://your-h5-url.com
```

## 编写测试

### 基础示例

```typescript
import { test, expect } from '@playwright/test';

test('页面标题测试', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/预期的标题/);
});
```

### 移动端特有功能

```typescript
// 模拟触摸点击
await page.tap('.button');

// 模拟滑动
await page.touchscreen.swipe(
  { x: 100, y: 200 },
  { x: 100, y: 400 }
);

// 设置视口大小
await page.setViewportSize({ width: 375, height: 667 });
```

### 常用断言

```typescript
// 验证元素可见
await expect(page.locator('.element')).toBeVisible();

// 验证文本内容
await expect(page.locator('.text')).toHaveText('预期文本');

// 验证 URL
await expect(page).toHaveURL(/.*\/path/);

// 验证元素数量
await expect(page.locator('.item')).toHaveCount(5);
```

## 最佳实践

1. **使用 Page Object 模式** - 将页面元素和操作封装到单独的类中
2. **合理使用等待** - 使用 `waitForSelector`、`waitForLoadState` 等方法
3. **截图和录屏** - 配置失败时自动截图和录屏
4. **并行执行** - 利用 Playwright 的并行能力加快测试速度
5. **环境隔离** - 每个测试使用独立的浏览器上下文

## 调试技巧

```bash
# 使用 UI 模式查看测试执行过程
pnpm test:ui

# 使用调试模式，逐步执行
pnpm test:debug

# 查看详细日志
DEBUG=pw:api pnpm test
```

## 注意事项

- 支付宝小程序本身无法直接用 Playwright 测试，需要测试对应的 H5 页面
- 如果有登录态要求，需要在测试前设置好 Cookie 或 Storage
- 移动端测试注意设置正确的 User Agent 和视口大小
- 某些支付宝特有的 API 在 H5 环境下可能不可用

## 相关资源

- [Playwright 官方文档](https://playwright.dev)
- [Playwright 测试最佳实践](https://playwright.dev/docs/best-practices)
- [支付宝小程序文档](https://opendocs.alipay.com/mini)
