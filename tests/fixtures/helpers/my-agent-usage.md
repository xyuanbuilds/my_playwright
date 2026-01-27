# MyAgent Fixture 使用指南

## 简介

`myAgent` 是一个用于简化智能体对话页面交互的 fixture，封装了查找输入框和发送消息的操作。

## 快速开始

### 基本使用

```typescript
import { test, expect } from "../fixtures";

test("智能体对话测试", async ({ page, myAgent }) => {
  // 访问智能体页面
  await page.goto("https://your-agent-page.com");

  // 发送消息
  await myAgent.send("附近停车场");

  // 继续测试...
});
```

## API

### send(message: string)

发送消息到智能体对话页面。

**参数：**
- `message`: 要发送的消息内容

**功能：**
1. 自动查找输入框（支持多种选择器）
2. 填充消息内容
3. 按 Enter 发送
4. 等待输入完成（默认 500ms）

**示例：**
```typescript
await myAgent.send("你好");
await myAgent.send("附近有什么好玩的");
```

### setSelectors(selectors: string[])

设置自定义输入框选择器。

**参数：**
- `selectors`: 选择器数组

**示例：**
```typescript
// 使用自定义选择器
myAgent.setSelectors(['input.custom-input', 'textarea#chat']);
await myAgent.send("消息内容");
```

## 默认选择器

MyAgent 默认尝试以下选择器（按顺序）：

1. `input[type="text"]` - 文本输入框
2. `input[placeholder*="输入"]` - 包含"输入"的输入框
3. `input[placeholder*="问"]` - 包含"问"的输入框
4. `textarea` - 文本域

如果找不到输入框，会抛出错误并列出已尝试的选择器。

## 使用示例

### 示例 1：简单对话

```typescript
test("简单对话", async ({ page, myAgent }) => {
  await page.goto("https://agent.example.com");

  await myAgent.send("你好");
  await page.waitForTimeout(2000);

  await myAgent.send("介绍一下你自己");
  await page.waitForTimeout(2000);
});
```

### 示例 2：结合 WebSocket 监控

```typescript
test("对话 + WebSocket 验证", async ({ page, myAgent, websocket }) => {
  await page.goto("https://agent.example.com");

  // 发送消息
  await myAgent.send("附近景点");

  // 等待响应
  await page.waitForTimeout(3000);

  // 验证 WebSocket 消息
  const messages = await websocket.getAllMessages();
  expect(messages.length).toBeGreaterThan(0);
});
```

### 示例 3：多轮对话

```typescript
test("多轮对话测试", async ({ page, myAgent }) => {
  await page.goto("https://agent.example.com");

  const questions = [
    "附近有什么好玩的",
    "推荐几个餐厅",
    "交通怎么去",
  ];

  for (const question of questions) {
    await myAgent.send(question);
    await page.waitForTimeout(3000);
  }
});
```

### 示例 4：自定义选择器

```typescript
test("自定义选择器", async ({ page, myAgent }) => {
  await page.goto("https://custom-agent.example.com");

  // 设置自定义选择器
  myAgent.setSelectors([
    'input.agent-input',
    'textarea[data-testid="chat-input"]'
  ]);

  await myAgent.send("你好");
});
```

### 示例 5：与 waitForUIStable 结合

```typescript
import { test, expect, waitForUIStableWithLog } from "../fixtures";

test("等待 UI 稳定", async ({ page, myAgent }) => {
  await page.goto("https://agent.example.com");

  await myAgent.send("复杂查询");

  // 等待 UI 稳定后再继续
  await waitForUIStableWithLog(page, {
    logPrefix: "[waitForResponse]",
    maxWaitTime: 10000,
  });

  // 验证结果...
});
```

## 配置选项

创建时可以传入配置：

```typescript
import { MyAgent } from "../fixtures";

const agent = new MyAgent(page, {
  inputSelectors: ['input.custom'],  // 自定义选择器
  waitAfterSend: 1000,               // 发送后等待时间（毫秒）
});
```

**注意**：在 fixture 中使用时，配置是默认的，如需自定义可以使用 `setSelectors()` 方法。

## 实际应用

在 [websocket.spec.ts](../../tbox/websocket.spec.ts:121-124) 中的应用：

```typescript
// 原来的代码（约 25 行）：
// 查找输入框、填充内容、发送...

// 使用 myAgent 后（3 行）：
const secondRoundMessage = "附近停车场";
console.log(`\n[步骤 7-9] 发送第二轮消息`);
await myAgent.send(secondRoundMessage);
```

## 注意事项

1. **输入框必须可见**：myAgent 只会选择可见的输入框
2. **按 Enter 发送**：默认使用 Enter 键发送消息
3. **等待时间**：默认发送前等待 500ms，可以通过配置调整
4. **错误处理**：如果找不到输入框会抛出清晰的错误信息

## 扩展

如果需要更多功能，可以直接使用 `MyAgent` 类：

```typescript
import { MyAgent } from "../fixtures";

const agent = new MyAgent(page);

// 手动查找输入框
const input = await agent.findInput();

// 进行其他操作
await input.focus();
await input.type("逐字输入", { delay: 100 });
```
