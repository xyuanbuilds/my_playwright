# Claude Code 项目指南

## 基本规则

- 总是使用中文回答
- 总是使用 pnpm 安装依赖
- 除非我要求，否则不要进行任何 git 操作

---

## 项目简介

这是一个基于 **Playwright** 的 e2e 测试框架，用于测试智能体检测平台（TBox）。

### 技术栈

- **测试框架**: Playwright Test
- **语言**: TypeScript
- **包管理**: pnpm
- **Schema 验证**: Zod
- **视频合成**: ffmpeg（可选）

### 项目结构

```
├── tests/
│   ├── fixtures/           # 自定义 Playwright Fixtures
│   │   ├── index.ts        # Fixtures 统一导出
│   │   ├── helpers/        # 辅助工具类
│   │   │   ├── url-query-checker.ts   # URL 参数验证
│   │   │   ├── api-monitor.ts         # API 响应监控
│   │   │   ├── websocket-monitor.ts   # WebSocket 监控
│   │   │   ├── performance-monitor.ts # 性能监控
│   │   │   └── platform-context.ts    # 多平台上下文
│   │   └── page-utils.ts   # 页面工具函数（waitForUIStable）
│   └── tbox/               # TBox 业务测试
│       ├── basic.spec.ts   # 基础可访问性测试
│       ├── api.spec.ts     # API 响应验证测试
│       └── domain.json     # 测试目标配置
├── playwright.config.ts    # Playwright 配置
├── record_video.mjs        # 独立的视频录制脚本（Playwright 原生 API）
└── docs/                   # 文档
```

---

## 可用的 Skills

本项目配置了以下 Claude Code Skills，可以直接使用：

### 1. playwriter

**用途**: 通过 CDP 连接控制真实 Chrome 浏览器

**使用场景**:
- 需要保持登录态的测试
- 实时调试页面交互
- 无头浏览器无法覆盖的场景

**常用命令**:
```bash
playwriter session new          # 创建新会话
playwriter session list         # 查看会话列表
playwriter -s 1 -e "代码"       # 在会话中执行代码
```

**示例**:
```bash
playwriter -s 1 -e "await page.goto('https://example.com')"
playwriter -s 1 -e "await page.screenshot({ path: './screenshot.png' })"
```

### 2. playwriter-video-recording

**用途**: 在 playwriter 中录制测试视频

**背景**: playwriter 通过 CDP 连接浏览器，无法使用 Playwright 原生 recordVideo，需要用截图序列 + ffmpeg 合成。

**使用方法**: 参考 `.claude/skills/playwriter-video-recording/SKILL.md`

### 对比：record_video.mjs vs playwriter-video-recording

| 特性 | record_video.mjs | playwriter-video-recording |
|------|------------------|----------------------------|
| 方式 | Playwright 原生 | 截图 + ffmpeg |
| 登录态 | 需重新登录 | 保持已有登录态 |
| 场景 | CI/CD 自动化 | 手动调试 |

---

## 常用命令

```bash
# 安装依赖
pnpm install

# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test tests/tbox/basic.spec.ts

# UI 模式（带可视化界面）
pnpm test --ui

# 生成并查看测试报告
pnpm test --reporter=html
open playwright-report/index.html

# 更新截图基准
pnpm test --update-snapshots

# 调试模式
pnpm test --debug
```

---

## 自定义 Fixtures 使用指南

### urlQuery - URL 参数验证

```typescript
test('验证 URL 参数', async ({ urlQuery, page }) => {
  await page.goto('https://example.com?foo=bar');

  await urlQuery.expectParamExists('foo');
  await urlQuery.expectParamEquals('foo', 'bar');
  const value = await urlQuery.getParam('foo');
});
```

### apiMonitor - API 响应监控

```typescript
test('验证 API 响应', async ({ apiMonitor, page }) => {
  // 开始监控特定 API
  apiMonitor.track('/api/data');

  await page.goto('https://example.com');

  // 等待并验证响应
  const response = await apiMonitor.waitForResponse('/api/data');
  expect(response.status).toBe(200);
});
```

### waitForUIStable - 等待 UI 稳定

```typescript
import { waitForUIStable } from '../fixtures';

test('等待 UI 稳定后截图', async ({ page }) => {
  await page.goto('https://example.com');

  // 等待 DOM 变化稳定（默认 1 秒无变化）
  await waitForUIStable(page, { stableDelay: 1000, maxWaitTime: 5000 });

  await page.screenshot({ path: './stable.png' });
});
```

---

## 配置文件说明

### domain.json

测试目标配置，支持数据驱动测试：

```json
{
  "domains": [
    {
      "name": "卡片综合",
      "url": "https://...",
      "description": "卡片综合域测试"
    }
  ]
}
```

### playwright.config.ts

- 默认使用 Mobile Chrome（Pixel 5）模拟
- 视口：375x667
- 语言：zh-CN
- 时区：Asia/Shanghai
- 失败时自动截图和录制视频

---

## 学习资源

- [Playwright 官方文档](https://playwright.dev/)
- [演讲文档](docs/AI辅助e2e测试编写实战.md) - AI 辅助 e2e 测试编写实战
- [项目概览](PROJECT_OVERVIEW.md)
