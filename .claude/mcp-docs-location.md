# MCP 文档位置说明

此文件用于告知 Claude Code 项目中 MCP 相关文档的位置。

## MCP 文档目录

**主目录**: `/docs/mcp/`

## 文档结构

```
/docs/mcp/
├── README.md           # MCP 服务器索引和管理指南
└── playwriter.md       # Playwriter MCP 服务器文档
```

## 配置文件位置

- **MCP 服务器配置**: `/.mcp.json`
- **项目级设置**: `/.claude/settings.json`
- **权限配置**: `/.claude/settings.local.json`

## 访问文档

### 通过文件路径

```
docs/mcp/README.md          # MCP 文档索引
docs/mcp/playwriter.md      # Playwriter 文档
docs/integration-guide.md   # 整合使用指南
docs/README.md              # 文档中心首页
```

### 通过相对路径（从项目根目录）

```bash
cat docs/mcp/README.md           # 查看 MCP 索引
cat docs/mcp/playwriter.md       # 查看 Playwriter 文档
ls docs/mcp/                     # 列出所有 MCP 文档
```

## 添加新 MCP 服务器文档

1. 在 `docs/mcp/` 目录创建新的 `.md` 文件
2. 更新 `docs/mcp/README.md` 索引
3. 更新 `.mcp.json` 配置
4. （可选）更新本文件的文档列表

## 已集成的 MCP 服务器

### Playwriter
- **文档**: `docs/mcp/playwriter.md`
- **配置**: `.mcp.json` 中的 `playwriter` 条目
- **状态**: ✅ 已配置（需要 Chrome 扩展）

---

**注意**:
- 所有 MCP 相关文档统一放在 `docs/mcp/` 目录
- 整合使用指南放在 `docs/integration-guide.md`
- 其他项目文档放在项目根目录或 `docs/` 目录

**最后更新**: 2026-01-26
