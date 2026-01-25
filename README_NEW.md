# 智能网站自动化检测平台

一个集成了 Playwright、Claude Code 和 Playwriter MCP 的现代化网站自动化检测平台，支持批量性能检测、真实浏览器调试和 AI 辅助分析。

## ✨ 核心功能

### 1. 通用检测工具 🔍
批量检测网站性能和资源完整性
- ✅ 交互式命令行界面
- ✅ 批量检测支持
- ✅ 性能指标收集（TTFB、FCP、LCP）
- ✅ 资源完整性检查
- ✅ 自动截图
- ✅ 结构化 JSON 报告

### 2. Playwriter MCP 集成 🎭
在真实浏览器中执行 Playwright 代码
- ✅ 保持登录状态
- ✅ 支持浏览器扩展
- ✅ 可视化调试
- ✅ 与 Claude Code 无缝集成

### 3. 原生 Playwright 测试 🧪
传统的 H5 移动端测试环境
- ✅ 支付宝 H5 页面测试
- ✅ 移动端设备模拟
- ✅ 触摸事件测试

## 🚀 快速开始

### 安装依赖

```bash
# 安装项目依赖
pnpm install

# 安装浏览器（首次使用）
pnpm exec playwright install chromium
```

### 使用通用检测工具

```bash
# 运行交互式检测工具
pnpm run monitor

# 按提示输入网址
# 检测结果保存在 detection-records/ 目录
```

**示例**:
```
欢迎使用网站检测工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请输入要检测的网址（输入空行完成添加）:
> https://example.com
✓ 已添加: https://example.com

请输入要检测的网址（输入空行完成添加）:
> [Enter]

是否开始检测? (Y/n) > Y

开始检测...
[1/1] ✓ https://example.com (1234ms)

检测完成！
报告路径: detection-records/2026-01-26/
```

### 使用 Playwriter（需要先配置）

1. 安装 Chrome 扩展（必需）
2. 重启 Claude Code
3. 与 Claude 对话：
   ```
   "使用 Playwriter 打开 https://example.com 并截图"
   ```

### 运行原生测试

```bash
# 运行所有测试
pnpm test

# UI 模式（推荐）
pnpm test:ui

# 只运行移动端测试
pnpm test:mobile
```

## 📂 项目结构

```
my_playwright/
├── src/                          # 检测工具源代码
│   ├── monitor/                  # 核心监测模块
│   │   ├── interactive-cli.ts    # 交互式入口
│   │   ├── detector.ts           # 核心检测器
│   │   ├── performance-collector.ts
│   │   ├── resource-checker.ts
│   │   ├── screenshot-manager.ts
│   │   ├── report-generator.ts
│   │   └── types.ts
│   └── utils/                    # 工具函数
│       ├── date-helper.ts
│       └── file-helper.ts
│
├── tests/                        # Playwright 测试用例
│   ├── example.spec.ts
│   └── h5-app.spec.ts
│
├── detection-records/            # 检测记录（按日期）
│   └── YYYY-MM-DD/
│       ├── HHmmss-domain.json
│       └── HHmmss-batch-summary.json
│
├── detection-screenshots/        # 检测截图（按日期）
│   └── YYYY-MM-DD/
│       └── HHmmss-domain.png
│
├── .mcp.json                     # MCP 服务器配置
├── playwright.config.ts          # Playwright 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖
```

## 📖 详细文档

- **[📚 文档中心](docs/README.md)** - 所有文档的导航中心 ⭐推荐
- **[检测工具使用说明](MONITOR_README.md)** - 通用检测工具完整指南
- **[MCP 服务器文档](docs/mcp/README.md)** - MCP 集成和管理 📁
  - [Playwriter 配置指南](docs/mcp/playwriter.md) - Playwriter MCP 详细配置
- **[整合使用指南](docs/integration-guide.md)** - 三大工具协同工作流程
- **[原 README](README.md)** - 原生 Playwright 测试说明

## 🎯 使用场景

### 场景 1: 公开网站批量检测
**使用**: 本地检测工具
```bash
pnpm run monitor
```
适合定期监控多个网站的性能。

### 场景 2: 需要登录的系统检测
**使用**: Playwriter + Claude Code
```
与 Claude 对话:
"用 Playwriter 检测内部系统性能，我需要先手动登录"
```
适合企业内部系统、需要身份验证的应用。

### 场景 3: 复杂交互测试
**使用**: Playwriter + Claude Code
```
与 Claude 对话:
"测试购物流程：搜索 → 加入购物车 → 结算，记录每步性能"
```
适合 SPA、复杂业务流程测试。

### 场景 4: 调试检测失败
**使用**: Playwriter 可视化调试
```
与 Claude 对话:
"这个网址检测失败了，帮我在真实浏览器中重现"
```
适合问题排查和调试。

## 🔧 配置说明

### 检测工具配置

检测配置在 [`src/monitor/detector.ts`](src/monitor/detector.ts) 中：
- 超时时间: 30 秒
- 等待条件: networkidle
- 截图模式: 全屏

### Playwriter 配置

MCP 服务器配置在 [`.mcp.json`](.mcp.json) 中：
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"],
      "env": {
        "PLAYWRITER_AUTO_ENABLE": "1"
      }
    }
  }
}
```

### Playwright 测试配置

测试配置在 [`playwright.config.ts`](playwright.config.ts:1) 中：
- 基础 URL: https://m.alipay.com
- 支持设备: Mobile Chrome、Mobile Safari、Desktop Chrome
- 失败处理: 自动截图和视频录制

## 📊 报告格式

### 单个网址检测结果

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-26T14:30:52.123Z",
  "status": "success",
  "httpStatus": 200,
  "loadTime": 2345,
  "performanceMetrics": {
    "domContentLoaded": 1234,
    "timeToFirstByte": 156,
    "firstContentfulPaint": 890,
    "largestContentfulPaint": 1456,
    "totalRequests": 45
  },
  "resourceCheck": {
    "totalResources": 45,
    "failedResources": [],
    "allResourcesLoaded": true
  },
  "screenshotPath": "detection-screenshots/2026-01-26/143052-example.com.png"
}
```

### 批量检测汇总报告

```json
{
  "batchId": "batch-20260126-143052",
  "totalUrls": 2,
  "successCount": 2,
  "summary": {
    "averageLoadTime": 1789.5,
    "fastestUrl": "https://example.com",
    "slowestUrl": "https://github.com"
  }
}
```

## 🤝 与 Claude Code 协作

### 智能任务分配

Claude Code 会根据您的需求自动选择最合适的工具：

```
您: "检测这 5 个网址的性能"
Claude: → 使用本地检测工具（批量、快速）

您: "检测需要登录的内部系统"
Claude: → 使用 Playwriter（保持会话）

您: "对比新旧版本性能"
Claude: → 结合两种工具（基准 + 对比）
```

### AI 辅助分析

让 Claude 帮您：
- 分析检测结果
- 识别性能瓶颈
- 生成优化建议
- 对比历史数据
- 生成可视化报告

## 🛠️ 开发指南

### 添加新的检测指标

编辑 [`src/monitor/performance-collector.ts`](src/monitor/performance-collector.ts:1)：
```typescript
// 添加自定义指标
const customMetric = await page.evaluate(() => {
  // 您的指标收集代码
});
```

### 自定义报告格式

编辑 [`src/monitor/report-generator.ts`](src/monitor/report-generator.ts:1)：
```typescript
// 修改报告结构
export interface CustomReport extends DetectionResult {
  // 添加自定义字段
}
```

### 扩展 MCP 功能

在 [`.mcp.json`](.mcp.json:1) 中添加更多 MCP 服务器。

## ⚠️ 注意事项

1. **检测频率**: 避免对同一网址频繁检测，遵守网站的爬虫规则
2. **认证信息**: 不要将认证信息提交到版本控制
3. **资源使用**: 批量检测会占用较多系统资源
4. **浏览器版本**: 定期更新 Playwright 浏览器
5. **Playwriter 扩展**: 必须安装并启用 Chrome 扩展才能使用

## 🔄 更新日志

### v2.0.0 - 2026-01-26
- ✨ 新增通用检测工具
- ✨ 集成 Playwriter MCP 服务器
- ✨ 添加 Claude Code 协作指南
- 📝 完善文档和使用示例

### v1.0.0 - 原始版本
- 🎉 Playwright H5 测试环境
- 📱 移动端设备模拟
- 🧪 基础测试用例

## 📚 资源链接

- [Playwright 官方文档](https://playwright.dev/)
- [Playwriter GitHub](https://github.com/remorses/playwriter)
- [Claude Code 文档](https://claude.ai/claude-code)
- [MCP 协议文档](https://modelcontextprotocol.io/)

## 🤔 常见问题

### Q: 检测工具和 Playwriter 有什么区别？
A: 检测工具使用无头浏览器，适合批量自动化；Playwriter 使用真实浏览器，适合需要登录和交互的场景。

### Q: 如何选择使用哪个工具？
A: 参考 [整合使用指南](INTEGRATION_GUIDE.md) 中的场景说明。

### Q: Playwriter 必须要安装吗？
A: 不是必须的。如果只需要批量检测公开网站，使用本地检测工具即可。

### Q: 报告数据可以导出吗？
A: 可以。报告是标准 JSON 格式，可以轻松解析和导出为其他格式。

### Q: 如何清理旧的检测记录？
A: 手动删除 `detection-records/` 和 `detection-screenshots/` 目录中的旧文件。

## 📄 许可证

ISC

## 🙏 致谢

- Playwright 团队提供优秀的自动化测试框架
- Playwriter 项目实现了创新的 MCP 集成
- Claude Code 让 AI 辅助开发成为现实

---

**开始使用**: `pnpm run monitor` 🚀
