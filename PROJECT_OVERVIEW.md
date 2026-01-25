# 项目全景图

智能网站自动化检测平台 - 完整项目导览

## 🗺️ 项目地图

```
智能网站自动化检测平台
│
├─ 🔍 通用检测工具              → pnpm run monitor
│   ├─ 交互式命令行
│   ├─ 批量性能检测
│   ├─ 资源完整性检查
│   └─ 自动截图和报告
│
├─ 🎭 Playwriter MCP           → 与 Claude 对话使用
│   ├─ 真实浏览器控制
│   ├─ 保持登录状态
│   ├─ 可视化调试
│   └─ 复杂交互测试
│
└─ 🧪 原生 Playwright 测试      → pnpm test
    ├─ H5 移动端测试
    ├─ 设备模拟
    └─ 自动化测试套件
```

## 📂 完整目录结构

```
my_playwright/
│
├─ 📄 入口文档
│  ├─ README_NEW.md              ⭐ 项目主页 - 从这里开始
│  ├─ MONITOR_README.md          📖 检测工具详细文档
│  └─ README.md                  📖 原生测试文档
│
├─ 📚 文档中心 (docs/)
│  ├─ README.md                  📑 文档导航索引
│  ├─ integration-guide.md       🔗 整合使用指南
│  │
│  └─ mcp/                       📁 MCP 文档专区
│     ├─ README.md               📑 MCP 索引和管理
│     └─ playwriter.md           📖 Playwriter 配置
│
├─ ⚙️ 配置文件
│  ├─ .mcp.json                  🔧 MCP 服务器配置
│  ├─ tsconfig.json              🔧 TypeScript 配置
│  ├─ playwright.config.ts       🔧 Playwright 配置
│  ├─ package.json               📦 项目依赖
│  │
│  └─ .claude/                   🤖 Claude Code 配置
│     ├─ settings.json           ⚙️ 项目级设置
│     ├─ settings.local.json     ⚙️ 本地权限
│     └─ mcp-docs-location.md    📍 MCP 文档位置说明
│
├─ 💻 源代码 (src/)
│  ├─ monitor/                   🔍 检测工具核心
│  │  ├─ interactive-cli.ts      💬 交互式入口
│  │  ├─ detector.ts             🎯 核心检测器
│  │  ├─ performance-collector.ts 📊 性能收集
│  │  ├─ resource-checker.ts      ✅ 资源检查
│  │  ├─ screenshot-manager.ts    📸 截图管理
│  │  ├─ report-generator.ts      📄 报告生成
│  │  └─ types.ts                 📝 类型定义
│  │
│  └─ utils/                     🛠️ 工具函数
│     ├─ date-helper.ts           📅 日期格式化
│     └─ file-helper.ts           📁 文件操作
│
├─ 🧪 测试文件 (tests/)
│  ├─ example.spec.ts            📝 基础示例
│  └─ h5-app.spec.ts             📱 H5 应用测试
│
└─ 📊 输出目录
   ├─ detection-records/          📈 检测记录 (按日期)
   │  └─ YYYY-MM-DD/
   │     ├─ HHmmss-domain.json
   │     └─ HHmmss-batch-summary.json
   │
   └─ detection-screenshots/      📸 检测截图 (按日期)
      └─ YYYY-MM-DD/
         └─ HHmmss-domain.png
```

## 🎯 快速导航

### 我想了解项目全貌
→ 阅读 [README_NEW.md](README_NEW.md)

### 我想查看所有文档
→ 访问 [文档中心](docs/README.md)

### 我想使用检测工具
→ 运行 `pnpm run monitor`
→ 阅读 [检测工具文档](MONITOR_README.md)

### 我想配置 Playwriter
→ 阅读 [Playwriter 配置](docs/mcp/playwriter.md)
→ 安装 Chrome 扩展
→ 重启 Claude Code

### 我想添加新的 MCP 服务器
→ 阅读 [MCP 管理文档](docs/mcp/README.md)
→ 按照步骤配置和创建文档

### 我想了解最佳实践
→ 阅读 [整合使用指南](docs/integration-guide.md)

### 我想运行原生测试
→ 运行 `pnpm test`
→ 阅读 [测试文档](README.md)

## 🚀 三分钟快速上手

### 方案 A: 使用检测工具（最简单）

```bash
# 1. 运行工具
pnpm run monitor

# 2. 输入网址
https://example.com
[Enter]

# 3. 确认检测
Y

# 4. 查看报告
cat detection-records/2026-01-26/HHmmss-batch-summary.json
```

### 方案 B: 使用 Playwriter（需要配置）

```bash
# 1. 安装 Chrome 扩展
# 访问 Chrome 网上应用店搜索 "Playwriter"

# 2. 重启 Claude Code

# 3. 与 Claude 对话
"使用 Playwriter 打开 https://example.com"
```

### 方案 C: 运行原生测试

```bash
# 运行测试
pnpm test:ui
```

## 📖 文档层次结构

```
📚 文档系统
│
├─ 第一层: 项目入口
│  └─ README_NEW.md (主页)
│
├─ 第二层: 专题文档
│  ├─ MONITOR_README.md (检测工具)
│  ├─ docs/README.md (文档中心)
│  └─ README.md (原生测试)
│
├─ 第三层: 详细指南
│  ├─ docs/mcp/README.md (MCP 管理)
│  └─ docs/integration-guide.md (整合指南)
│
└─ 第四层: 具体实现
   └─ docs/mcp/playwriter.md (Playwriter)
```

## 🔄 工作流程图

```
开始
  │
  ├─ 简单批量检测？
  │  └─ YES → 使用检测工具 → pnpm run monitor
  │
  ├─ 需要登录/复杂交互？
  │  └─ YES → 使用 Playwriter → 与 Claude 对话
  │
  ├─ H5 移动端测试？
  │  └─ YES → 使用原生测试 → pnpm test
  │
  └─ 不确定？
     └─ 阅读整合指南 → docs/integration-guide.md
```

## 🎓 学习路径

### 初级（1天）
1. ✅ 阅读 README_NEW.md
2. ✅ 运行 pnpm run monitor 体验
3. ✅ 查看生成的报告

### 中级（3天）
1. ✅ 配置 Playwriter
2. ✅ 尝试与 Claude Code 协作
3. ✅ 阅读整合使用指南

### 高级（1周）
1. ✅ 自定义检测指标
2. ✅ 添加新的 MCP 服务器
3. ✅ 编写自动化脚本

## 💡 常见任务快速参考

| 任务 | 命令/文档 |
|------|-----------|
| 批量检测网站 | `pnpm run monitor` |
| 在真实浏览器调试 | 与 Claude 对话 "用 Playwriter..." |
| 运行测试 | `pnpm test` |
| 查看 MCP 文档 | `cat docs/mcp/README.md` |
| 添加 MCP 服务器 | 编辑 `.mcp.json` |
| 查看检测报告 | `ls detection-records/` |
| 编译 TypeScript | `pnpm tsc --noEmit` |

## 🔗 关键文件快速访问

```bash
# 配置文件
cat .mcp.json                      # MCP 配置
cat .claude/settings.json          # Claude 设置
cat playwright.config.ts           # Playwright 配置

# 文档
cat docs/README.md                 # 文档中心
cat docs/mcp/README.md             # MCP 索引
cat docs/mcp/playwriter.md         # Playwriter 配置
cat docs/integration-guide.md     # 整合指南

# 源代码
ls src/monitor/                    # 检测工具
ls src/utils/                      # 工具函数

# 报告
ls detection-records/              # 检测记录
ls detection-screenshots/          # 截图
```

## 📊 项目统计

- **文档数量**: 7 个主要文档
- **MCP 服务器**: 1 个（Playwriter，可扩展）
- **源代码模块**: 9 个 TypeScript 文件
- **测试用例**: 2 个测试套件
- **配置文件**: 4 个主要配置

## 🎯 下一步行动

### 如果您是新用户
1. 阅读 [README_NEW.md](README_NEW.md)
2. 运行 `pnpm run monitor` 体验检测工具
3. 探索 [文档中心](docs/README.md)

### 如果您想深入使用
1. 配置 Playwriter（[配置指南](docs/mcp/playwriter.md)）
2. 学习 [整合使用指南](docs/integration-guide.md)
3. 尝试添加新的 MCP 服务器

### 如果您想参与开发
1. 熟悉代码结构（`src/` 目录）
2. 了解类型定义（`src/monitor/types.ts`）
3. 扩展检测功能或添加新模块

---

**版本**: v2.0
**最后更新**: 2026-01-26
**维护者**: 项目团队

---

## 快速跳转

- [📄 项目主页](README_NEW.md)
- [📚 文档中心](docs/README.md)
- [📁 MCP 文档](docs/mcp/README.md)
- [🔗 整合指南](docs/integration-guide.md)
- [📖 检测工具](MONITOR_README.md)
