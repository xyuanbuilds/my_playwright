# 项目文档中心

欢迎来到项目文档中心！本目录包含项目的所有详细文档。

## 📚 文档结构

```
docs/
├── README.md                    # 本文件 - 文档索引
├── mcp/                         # MCP 服务器文档
│   ├── README.md               # MCP 文档索引
│   └── playwriter.md           # Playwriter MCP 服务器
└── integration-guide.md        # 整合使用指南
```

## 📖 主要文档

### 快速开始

- **[项目主 README](../README_NEW.md)** - 项目总览和快速开始 ⭐推荐首先阅读

### 核心功能

- **[检测工具文档](../MONITOR_README.md)** - 通用网站检测工具完整指南
  - 功能特性
  - 使用方法
  - 报告格式
  - 配置选项

### MCP 集成

- **[MCP 服务器文档](mcp/README.md)** - MCP 服务器索引和管理 📁
  - 已集成的 MCP 服务器列表
  - 添加新 MCP 服务器的步骤
  - 配置说明
  - 故障排查

- **[Playwriter MCP 文档](mcp/playwriter.md)** - Playwriter 详细配置指南
  - 安装步骤
  - Chrome 扩展配置
  - 使用方法
  - 工作原理

### 高级指南

- **[整合使用指南](integration-guide.md)** - 三大工具协同工作流程
  - 检测工具 + Playwriter + Claude Code
  - 5 个实战场景
  - 最佳实践
  - 工作流程图

### 原生测试

- **[Playwright 测试文档](../README.md)** - 原生 Playwright H5 测试环境

## 🎯 按使用场景查找

### 场景 1: 我想批量检测网站性能
→ 阅读 [检测工具文档](../MONITOR_README.md)

### 场景 2: 我需要在真实浏览器中调试
→ 阅读 [Playwriter 文档](mcp/playwriter.md)

### 场景 3: 我想添加新的 MCP 服务器
→ 阅读 [MCP 文档索引](mcp/README.md) 的"添加新的 MCP 服务器"部分

### 场景 4: 我想了解如何结合使用这些工具
→ 阅读 [整合使用指南](integration-guide.md)

### 场景 5: 我想进行移动端 H5 测试
→ 阅读 [Playwright 测试文档](../README.md)

## 🔧 配置文件位置

### MCP 相关配置

- **项目级 MCP 配置**: [`/.mcp.json`](../.mcp.json:1)
- **Claude Code 设置**: [`/.claude/settings.json`](../.claude/settings.json:1)
- **权限配置**: [`/.claude/settings.local.json`](../.claude/settings.local.json:1)

### 项目配置

- **TypeScript 配置**: [`/tsconfig.json`](../tsconfig.json:1)
- **Playwright 配置**: [`/playwright.config.ts`](../playwright.config.ts:1)
- **包管理配置**: [`/package.json`](../package.json:1)

## 📝 文档维护指南

### 添加新文档

1. 根据文档类型选择目录：
   - MCP 相关 → `docs/mcp/`
   - 整合指南 → `docs/`
   - 工具文档 → 项目根目录

2. 创建 Markdown 文件

3. 更新相应的索引文件：
   - MCP 文档 → 更新 `docs/mcp/README.md`
   - 其他文档 → 更新本文件

4. 更新主 README 的链接

### 文档命名规范

- 使用小写字母和连字符：`my-document.md`
- MCP 服务器文档使用服务器名：`playwriter.md`
- 保持简洁和描述性

### 文档内容结构

建议的文档结构：
```markdown
# 文档标题

简短介绍

## 功能/目的

## 快速开始

## 详细说明

## 示例

## 故障排查

## 相关资源
```

## 🔗 外部资源

- **[Playwright 官方文档](https://playwright.dev/)** - Playwright 自动化测试框架
- **[MCP 协议文档](https://modelcontextprotocol.io/)** - Model Context Protocol
- **[Claude Code 文档](https://docs.anthropic.com/claude-code)** - Claude Code 使用指南
- **[TypeScript 文档](https://www.typescriptlang.org/docs/)** - TypeScript 语言参考

## 💡 贡献文档

如果您想改进文档：

1. 遵循现有的文档结构和风格
2. 使用清晰的标题和代码示例
3. 添加实用的使用场景
4. 保持文档的及时更新

## 📧 反馈

如果您发现文档中的问题或有改进建议，请：
- 直接编辑相关文档
- 更新索引文件
- 与团队分享您的修改

---

**文档版本**: v2.0
**最后更新**: 2026-01-26
**维护者**: 项目团队

---

## 快速导航

- [← 返回项目主页](../README_NEW.md)
- [→ MCP 文档](mcp/README.md)
- [→ 整合指南](integration-guide.md)
- [→ 检测工具](../MONITOR_README.md)
