# MCP 服务器文档

本目录包含本项目集成的所有 MCP (Model Context Protocol) 服务器的文档。

## 什么是 MCP？

MCP (Model Context Protocol) 是一个开放协议，允许 AI 助手（如 Claude Code）连接到各种外部工具和服务。通过 MCP 服务器，Claude 可以：

- 执行本地工具和命令
- 访问外部 API
- 操作浏览器
- 连接数据库
- 以及更多扩展功能

## 已集成的 MCP 服务器

### 1. Playwriter 🎭

**文档**: [playwriter.md](playwriter.md:1)

**功能**: 在真实 Chrome 浏览器中执行 Playwright 代码

**适用场景**:
- 需要登录的网站检测
- 复杂的交互式测试
- 可视化调试
- 保持浏览器会话和扩展

**配置文件**: `/.mcp.json`

**使用方式**:
```
与 Claude Code 对话:
"使用 Playwriter 打开 https://example.com"
```

**状态**: ✅ 已配置（需要安装 Chrome 扩展）

---

## 配置位置

### 项目级 MCP 配置

**文件**: [`.mcp.json`](../../.mcp.json:1)
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

### Claude Code 项目设置

**文件**: [`.claude/settings.json`](../../.claude/settings.json:1)
```json
{
  "enableAllProjectMcpServers": true
}
```

这个设置告诉 Claude Code 自动启用项目中配置的所有 MCP 服务器。

---

## 添加新的 MCP 服务器

### 步骤 1: 安装服务器

根据 MCP 服务器的要求安装必要的依赖。例如：
```bash
npm install -g some-mcp-server
```

### 步骤 2: 配置服务器

在项目根目录的 [`.mcp.json`](../../.mcp.json:1) 文件中添加配置：

```json
{
  "mcpServers": {
    "playwriter": { ... },
    "new-server": {
      "command": "npx",
      "args": ["-y", "new-server@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 步骤 3: 创建文档

在本目录创建新的 Markdown 文档：
```bash
touch docs/mcp/new-server.md
```

文档应包含：
- 服务器功能说明
- 安装步骤
- 配置详情
- 使用示例
- 故障排查

### 步骤 4: 更新此索引

在本文件的"已集成的 MCP 服务器"部分添加新服务器的条目。

### 步骤 5: 重启 Claude Code

退出并重新打开 Claude Code，新的 MCP 服务器将自动加载。

---

## 常见 MCP 服务器推荐

### 开发工具类

- **[@modelcontextprotocol/server-filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)** - 安全的文件系统访问
- **[@modelcontextprotocol/server-git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)** - Git 仓库操作
- **[@modelcontextprotocol/server-github](https://github.com/modelcontextprotocol/servers/tree/main/src/github)** - GitHub API 集成

### 数据库类

- **[@modelcontextprotocol/server-postgres](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)** - PostgreSQL 数据库
- **[@modelcontextprotocol/server-sqlite](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)** - SQLite 数据库

### 浏览器自动化

- **[playwriter](https://github.com/remorses/playwriter)** - 真实浏览器控制（已集成）
- **[@modelcontextprotocol/server-puppeteer](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)** - Puppeteer 浏览器自动化

### 搜索和知识

- **[@modelcontextprotocol/server-brave-search](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)** - Brave 搜索 API
- **[@modelcontextprotocol/server-google-maps](https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps)** - Google Maps API

---

## 故障排查

### MCP 服务器未启动

1. 检查 `.mcp.json` 配置是否正确
2. 确保 `enableAllProjectMcpServers: true` 已在 `.claude/settings.json` 中设置
3. 重启 Claude Code
4. 查看 Claude Code 的调试日志

### 服务器连接失败

1. 确认服务器命令可以在终端中独立运行
2. 检查环境变量是否正确设置
3. 查看服务器的特定要求（如 API 密钥、权限等）

### 权限问题

在 [`.claude/settings.local.json`](../../.claude/settings.local.json:1) 中添加必要的权限：
```json
{
  "permissions": {
    "allow": [
      "Bash(your-command:*)"
    ]
  }
}
```

---

## 相关文档

- **[MCP 协议官方文档](https://modelcontextprotocol.io/)** - MCP 协议规范
- **[MCP 服务器列表](https://github.com/modelcontextprotocol/servers)** - 官方 MCP 服务器集合
- **[Claude Code 文档](https://docs.anthropic.com/claude-code)** - Claude Code 使用指南

---

## 项目集成指南

如何在本项目中有效使用 MCP 服务器，请参考：
- **[整合使用指南](../integration-guide.md)** - 三大工具协同工作流程

---

## 贡献

如果您发现有用的 MCP 服务器或改进建议，欢迎：
1. 在本目录添加新的服务器文档
2. 更新 `.mcp.json` 配置
3. 更新本索引文件

---

**最后更新**: 2026-01-26
**维护者**: 项目团队
