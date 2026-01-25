# Playwriter MCP 集成指南

Playwriter 是一个 MCP (Model Context Protocol) 服务器，可以让 Claude Code 在您的真实 Chrome 浏览器中执行 Playwright 代码，而不是启动新的无头浏览器。这对于调试和测试非常有用。

## 安装状态 ✅

以下组件已经成功安装和配置：

- ✅ **Playwriter CLI** - 已全局安装
- ✅ **MCP 服务器配置** - 已在 `.mcp.json` 中配置
- ✅ **Claude Code 集成** - 已启用项目级 MCP 服务器

## 完成安装（必需）

### 1. 安装 Chrome 扩展

**这一步必须手动完成：**

1. 访问 Chrome 网上应用店搜索 "Playwriter"
2. 或访问：https://chromewebstore.google.com/search/playwriter
3. 点击"添加到 Chrome"安装扩展
4. 安装后，在任何标签页点击 Playwriter 图标直到它变成**绿色**

> **重要**：扩展图标必须显示为绿色才能正常工作！

### 2. 验证安装

安装扩展后，打开一个新的终端窗口并运行：

```bash
# 启动 Playwriter 服务器（测试连接）
playwriter serve
```

如果看到类似以下输出，说明安装成功：
```
Playwriter relay server started on ws://localhost:19988
Waiting for browser connections...
```

按 `Ctrl+C` 停止测试服务器。

## 配置详情

### 项目文件

**`.mcp.json`** - MCP 服务器配置：
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

**`.claude/settings.json`** - 项目设置：
```json
{
  "enableAllProjectMcpServers": true
}
```

### 配置说明

- **自动启用模式**：`PLAYWRITER_AUTO_ENABLE=1` 会自动创建新标签页，无需手动点击扩展图标
- **最新版本**：使用 `playwriter@latest` 确保始终使用最新功能
- **项目级启用**：MCP 服务器仅在此项目中启用

## 使用方法

### 在 Claude Code 中使用

重启 Claude Code 后，Playwriter MCP 服务器会自动启动。您可以直接与 Claude 对话，要求它：

1. **在真实浏览器中打开网页**
   ```
   使用 Playwriter 在浏览器中打开 https://example.com 并截图
   ```

2. **执行自动化测试**
   ```
   用 Playwriter 测试登录流程，检查是否成功
   ```

3. **调试现有代码**
   ```
   用 Playwriter 执行我的检测脚本，看看哪里出错了
   ```

### 与本项目的检测工具结合

Playwriter 可以完美配合本项目的自动化检测工具使用：

**优势：**
- 🔐 **保持登录状态** - 使用真实浏览器，保留 Cookie 和会话
- 🔌 **使用浏览器扩展** - 支持现有的 Chrome 扩展
- 👀 **可视化调试** - 实时看到浏览器操作
- 🚀 **快速迭代** - 无需每次启动新浏览器

**示例场景：**
```typescript
// 使用 Playwriter 在已登录的浏览器中检测内部系统
// 无需每次都重新登录
```

### 命令行工具

Playwriter 提供了强大的 CLI 工具：

```bash
# 创建隔离会话
playwriter session new

# 查看活动会话
playwriter session list

# 在特定会话中执行代码
playwriter -s 1 -e "await page.goto('https://example.com')"

# 启动服务器（远程使用）
playwriter serve --token <secret>
```

## 工作原理

```
┌─────────────────┐
│  Claude Code    │
│                 │
│  (执行 Playwright│
│   代码请求)      │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│  Playwriter     │
│  MCP Server     │
│                 │
│  (WebSocket     │
│   Relay)        │
└────────┬────────┘
         │
         │ WebSocket (localhost:19988)
         │
┌────────▼────────┐
│  Chrome         │
│  + Extension    │
│                 │
│  (执行实际的    │
│   浏览器操作)   │
└─────────────────┘
```

## 故障排查

### MCP 服务器未启动

1. 检查 Claude Code 是否在项目根目录启动
2. 检查 `.mcp.json` 文件是否存在
3. 重启 Claude Code

### 扩展未连接

1. 确保 Chrome 扩展已安装
2. 点击扩展图标直到变成**绿色**
3. 检查是否有防火墙阻止 `localhost:19988`

### 找不到 playwriter 命令

```bash
# 重新安装
npm install -g playwriter

# 验证安装
which playwriter
```

### 命令执行失败

确保：
- Chrome 浏览器正在运行
- 扩展已启用（绿色图标）
- 目标页面已加载

## 高级配置

### 远程使用（Docker/SSH）

如果在远程环境中使用，在本地机器运行：
```bash
playwriter serve --token my-secret-token
```

然后在 `.mcp.json` 中配置：
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "playwriter",
      "args": ["--host", "192.168.1.100", "--token", "my-secret-token"]
    }
  }
}
```

### 禁用自动启用

如果不想自动创建标签页，移除环境变量：
```json
{
  "mcpServers": {
    "playwriter": {
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
```

## 资源链接

- **GitHub 仓库**: https://github.com/remorses/playwriter
- **MCP 文档**: https://github.com/remorses/playwriter/blob/main/MCP.md
- **问题反馈**: https://github.com/remorses/playwriter/issues

## 下一步

现在您可以：
1. 安装 Chrome 扩展（必需）
2. 重启 Claude Code
3. 尝试使用 Playwriter 执行浏览器自动化任务
4. 将其与本项目的检测工具结合使用

享受真实浏览器自动化的便利！🎉
