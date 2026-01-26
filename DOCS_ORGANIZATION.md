# 项目文档组织规范

**版本**: 1.0
**更新日期**: 2026-01-26
**适用范围**: 全项目

## 📋 规范概述

本规范定义了项目文档的存放位置和组织方式，确保文档结构清晰、易于维护和查找。

## 🗂️ 目录结构规则

### 顶级目录

```
project-root/
├── docs/                      # 📁 所有项目文档存放处
│   ├── README.md             # 文档中心索引
│   ├── tools/                # 🛠️ 工具文档
│   │   └── monitor.md        # Monitor 检测工具文档
│   ├── config/               # ⚙️ 配置相关文档
│   ├── mcp/                  # 🔌 MCP 相关文档
│   ├── guides/               # 📖 使用指南（可选）
│   └── ...
├── README.md                 # 项目主文档
└── monitor.config.json       # 配置文件（非文档）
```

## 📚 文档分类与存放位置

### 1. 工具文档 → `docs/tools/`

**定义**: 项目内的核心工具或功能的完整文档

**包含内容**:
- ✅ Monitor 检测工具文档 (`monitor.md`)
- ✅ 其他工具的使用指南
- ✅ 工具特性说明
- ✅ 工具配置概览

**文件命名**: `<工具名>.md`

**特点**:
- 包含工具的完整使用说明
- 链接到相关的配置文档
- 是使用该工具的首选文档

**示例**:
```
docs/tools/
├── monitor.md
├── playwriter.md
└── custom-tool.md
```

### 2. 配置相关文档 → `docs/config/`

**定义**: 与系统配置、工具配置相关的文档

**包含内容**:
- ✅ 视口配置文档 (`viewport-config.md`)
- ✅ Monitor 工具配置 (`monitor-config.md`)
- ✅ 环境变量配置
- ✅ 浏览器配置
- ✅ 其他工具配置

**文件命名**: `<工具名>-config.md` 或 `<配置类型>-config.md`

**示例**:
```
docs/config/
├── viewport-config.md
├── monitor-config.md
├── playwright-config.md
└── environment-config.md
```

### 3. MCP 相关文档 → `docs/mcp/`

**定义**: 与 Model Context Protocol (MCP) 服务相关的文档

**包含内容**:
- ✅ MCP 服务器配置
- ✅ MCP 集成指南
- ✅ MCP 工具文档
- ✅ MCP 扩展开发

**文件命名**: `<服务器名>.md` 或 `<功能名>.md`

**示例**:
```
docs/mcp/
├── README.md
├── playwriter.md
├── integration-guide.md
└── custom-server.md
```

### 4. 项目主文档 → 项目根目录

**定义**: 项目级别的主要文档

**包含文档**:
- ✅ `README.md` - 项目主文档和快速开始

**特点**:
- 放在项目根目录便于快速查找
- 在项目 GitHub 首页即可看到
- 提供项目概览和快速导航

### 5. 使用指南 → `docs/guides/` (可选)

**定义**: 跨工具或高级用法指南

**包含内容**:
- ✅ 整合使用指南
- ✅ 最佳实践
- ✅ 常见场景指南

**示例**:
```
docs/guides/
├── integration-guide.md
├── best-practices.md
└── troubleshooting.md
```

### 6. API 文档 → `docs/api/` (可选)

**定义**: 代码 API 相关文档

**包含内容**:
- ✅ 函数 API 说明
- ✅ 类型定义文档
- ✅ 接口说明

## 📝 文件命名规范

| 文档类型 | 命名模式 | 示例 |
|---------|---------|------|
| 工具文档 | `<工具名>.md` | `monitor.md` |
| 配置文档 | `<名称>-config.md` | `monitor-config.md` |
| 集成指南 | `integration-guide.md` | `integration-guide.md` |
| 功能说明 | `<功能名>.md` | `viewport-config.md` |
| 索引文件 | `README.md` | `README.md` |

**命名原则**:
- ✅ 使用小写字母和连字符
- ✅ 描述清晰、见名知意
- ✅ 避免特殊字符和空格
- ❌ 不使用驼峰式 (camelCase)
- ❌ 不使用下划线连接

## 🔍 文档查找流程

### 用户需求 → 查找位置

| 需求 | 查找位置 | 文件 |
|-----|---------|------|
| Monitor 工具如何使用 | `docs/tools/` | `monitor.md` |
| 如何配置视口 | `docs/config/` | `viewport-config.md` |
| Monitor 配置详细选项 | `docs/config/` | `monitor-config.md` |
| MCP 如何集成 | `docs/mcp/` | `README.md` 或 `integration-guide.md` |
| 最佳实践 | `docs/guides/` | `best-practices.md` |
| 项目快速开始 | 项目根目录 | `README.md` |

## 🔗 文档链接规范

### 相对路径链接

```markdown
# 同目录引用
[视口配置](./viewport-config.md)

# 不同目录引用
[Monitor 工具配置](../config/monitor-config.md)

# 根目录文件
[Monitor 工具](../../MONITOR_README.md)
```

### 索引文件中的链接

```markdown
## 配置文档

- **[视口配置](config/viewport-config.md)** - Monitor 工具视口配置说明
- **[Monitor 配置](config/monitor-config.md)** - Monitor 工具完整配置指南

## MCP 文档

- **[MCP 文档索引](mcp/README.md)** - MCP 服务器管理
```

## 📄 文档结构模板

### 配置文档模板

```markdown
# 功能名称配置指南

简单介绍（一句话）。

## 概述

详细介绍该配置的作用和应用场景。

## 快速开始

最简单的配置示例。

## 配置项说明

表格列出所有配置项和说明。

## 完整配置示例

多个实际配置示例。

## 常见问题

QA 格式回答常见问题。

## 相关文档

链接到相关文档。
```

### 工具文档模板

```markdown
# 工具名称

简单介绍。

## 功能特性

列出主要功能。

## 快速开始

如何快速上手。

## 使用指南

详细使用说明。

## 配置说明

工具的配置方式。

## 故障排查

常见问题和解决方法。

## 相关文档

链接到相关文档。
```

## 🔄 文档更新工作流

### 1. 新增工具对应的文档

```
工具开发完成
    ↓
在 docs/tools/ 中创建 <工具名>.md
    ↓
更新 docs/README.md 的索引
    ↓
更新相关交叉引用
    ↓
与代码 commit 一起提交
```

### 2. 新增配置相关的文档

```
新增配置功能
    ↓
在 docs/config/ 中创建 <配置>-config.md
    ↓
在相关工具文档中链接到配置文档
    ↓
更新 docs/README.md 的索引
    ↓
与代码 commit 一起提交
```

### 3. 修改现有功能

```
功能修改完成
    ↓
找到对应文档文件（docs/tools/ 或 docs/config/）
    ↓
更新文档内容
    ↓
检查相关交叉引用
    ↓
与代码 commit 一起提交
```

## 📋 文档维护清单

维护者应定期检查以下项：

- [ ] 新增文档是否放在正确位置
- [ ] 文件命名是否遵循规范
- [ ] 文档索引是否更新
- [ ] 文档中的代码示例是否正确
- [ ] 链接是否有效（不存在 404）
- [ ] 文档是否与当前代码实现同步
- [ ] 敏感信息是否已移除
- [ ] 文档格式是否符合规范

## 🚫 反面例子（不应该这样）

❌ **错误**: 将工具文档放在项目根目录
```
项目根目录
├── MONITOR_README.md        # ❌ 应在 docs/tools/monitor.md
├── PLAYWRITER_README.md     # ❌ 应在 docs/tools/playwriter.md
└── README.md
```

❌ **错误**: 将配置文档放在项目根目录
```
项目根目录
├── monitor-config.md        # ❌ 应在 docs/config/ 下
├── viewport-config.md       # ❌ 应在 docs/config/ 下
└── README.md
```

❌ **错误**: 在 docs/ 根目录堆放所有文档
```
docs/
├── viewport-config.md       # ❌ 应在 docs/config/ 下
├── monitor-config.md        # ❌ 应在 docs/config/ 下
├── playwriter.md            # ❌ 应在 docs/mcp/ 下
└── mcp-integration.md       # ❌ 应在 docs/mcp/ 下
```

❌ **错误**: 使用不一致的命名
```
docs/config/
├── ViewportConfig.md        # ❌ 应使用小写和连字符
├── monitor_config.md        # ❌ 应使用连字符而非下划线
└── browserSettings.md       # ❌ 应使用连字符
```

## ✅ 正面例子（应该这样）

✅ **正确**: 工具和配置文档在专门目录
```
docs/
├── tools/
│   ├── monitor.md
│   └── playwriter.md
├── config/
│   ├── viewport-config.md
│   ├── monitor-config.md
│   └── environment-config.md
├── mcp/
│   ├── README.md
│   └── playwriter.md
└── README.md
```

✅ **正确**: 清晰的命名规范
```
docs/config/
├── viewport-config.md       # 清晰的配置类型
├── monitor-config.md        # 工具+config 模式
└── environment-config.md    # 功能+config 模式
```

✅ **正确**: 完整的交叉引用
```markdown
## 相关文档

- [视口配置详解](./viewport-config.md)
- [Monitor 工具完整指南](../../MONITOR_README.md)
- [项目文档中心](../README.md)
```

## 📞 联系与反馈

如有关于文档组织的问题或建议：

1. 查看本规范文档
2. 参考 `docs/README.md` 的维护指南
3. 与团队讨论和改进

---

**维护者**: 项目团队
**版本**: 1.0
**生效日期**: 2026-01-26
**下次审查**: 2026-06-26
