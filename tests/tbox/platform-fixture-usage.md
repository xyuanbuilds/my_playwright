# PlatformContext Fixture 使用指南

## 简介

`platformContext` 是一个用于管理不同平台（支付宝、微信、普通H5）浏览器上下文的 fixture，通过修改 User-Agent 和 viewport 来模拟不同平台环境。

## 快速开始

### 1. 导入

```typescript
import { test, expect, PLATFORMS, type PlatformType } from "../fixtures";
```

### 2. 基本使用

```typescript
test("支付宝平台测试", async ({ platformContext }) => {
  // 创建支付宝平台页面
  const { page, config } = await platformContext.createPlatformPage("alipay");

  // 访问页面
  await page.goto("https://example.com");

  // 添加你的测试逻辑
  // ...

  // fixture 会自动清理资源
});
```

### 3. 遍历所有平台

```typescript
test.describe("多平台测试", () => {
  (Object.keys(PLATFORMS) as PlatformType[]).forEach((platformKey) => {
    test(`${PLATFORMS[platformKey].name}`, async ({ platformContext }) => {
      const { page } = await platformContext.createPlatformPage(platformKey);
      await page.goto("https://example.com");
      // 测试逻辑...
    });
  });
});
```

## API

### createPlatformPage(platform)

创建指定平台的浏览器上下文和页面。

**参数：**
- `platform`: `"alipay"` | `"wechat"` | `"h5"` | `PlatformConfig`

**返回值：**
```typescript
{
  context: BrowserContext;  // 浏览器上下文
  page: Page;               // 页面对象
  config: PlatformConfig;   // 平台配置
}
```

**示例：**
```typescript
// 使用预定义平台
const { page, config } = await platformContext.createPlatformPage("alipay");

// 使用自定义配置
const { page } = await platformContext.createPlatformPage({
  name: "自定义平台",
  userAgent: "...",
  viewport: { width: 414, height: 896 }
});
```

## 预定义平台

```typescript
PLATFORMS = {
  alipay: {
    name: "支付宝",
    userAgent: "...AlipayClient...",
    viewport: { width: 375, height: 812 }
  },
  wechat: {
    name: "微信",
    userAgent: "...MicroMessenger...",
    viewport: { width: 375, height: 812 }
  },
  h5: {
    name: "普通H5",
    userAgent: "...Chrome Mobile...",
    viewport: { width: 375, height: 812 }
  }
}
```

## 完整示例

### 单平台测试
```typescript
test("支付宝平台", async ({ platformContext }) => {
  const { page } = await platformContext.createPlatformPage("alipay");
  await page.goto("https://example.com");

  // 你的测试逻辑
});
```

### 多平台对比
```typescript
test("多平台对比", async ({ platformContext }) => {
  const alipay = await platformContext.createPlatformPage("alipay");
  const wechat = await platformContext.createPlatformPage("wechat");

  await Promise.all([
    alipay.page.goto("https://example.com"),
    wechat.page.goto("https://example.com"),
  ]);

  // 对比逻辑
});
```

### 自定义平台
```typescript
test("自定义平台", async ({ platformContext }) => {
  const { page } = await platformContext.createPlatformPage({
    name: "iPad",
    userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) ...",
    viewport: { width: 1024, height: 768 }
  });

  await page.goto("https://example.com");
});
```

## 注意事项

1. **自动清理**：fixture 会在测试结束时自动清理所有创建的上下文和页面
2. **多页面支持**：可以在同一测试中创建多个平台页面
3. **平台识别**：确保你的应用能正确识别 User-Agent 中的关键字（AlipayClient、MicroMessenger）
