# Monitor 工具配置指南

Monitor 工具的完整配置说明，包括视口、浏览器行为、超时和其他相关设置。

## 概述

Monitor 工具通过 `monitor.config.json` 配置文件支持以下配置：
- 视口配置（尺寸、设备特性）
- 浏览器行为（无头模式、超时）
- 检测选项

## 配置文件位置

项目根目录：`/monitor.config.json`

## 完整配置结构

```typescript
{
  viewport?: {
    width: number;           // 视口宽度（必需）
    height: number;          // 视口高度（必需）
    deviceScaleFactor?: number;  // 设备像素比
    isMobile?: boolean;      // 是否为移动端
    hasTouch?: boolean;      // 是否支持触摸
    userAgent?: string;      // 自定义 User-Agent
  };
  browser?: {
    headless?: boolean;      // 无头模式
    timeout?: number;        // 超时时间（毫秒）
  };
}
```

## 配置选项详解

### 视口配置 (viewport)

#### width / height - 视口尺寸

```json
{
  "viewport": {
    "width": 1920,    // 宽度（像素）
    "height": 1080    // 高度（像素）
  }
}
```

- **必需**: ✅ 必须同时指定
- **取值范围**: 100-4000 像素
- **推荐值**:
  - PC: 1920x1080
  - 移动端: 390x844, 393x851
  - 平板: 768x1024

#### deviceScaleFactor - 设备像素比

```json
{
  "viewport": {
    "deviceScaleFactor": 2.75
  }
}
```

- **默认值**: 1
- **作用**: 影响 CSS 像素与物理像素的比例
- **常见值**:
  - 1: 桌面、笔记本
  - 2: 大多数安卓手机、iPad
  - 2.75: 某些 Pixel 手机
  - 3: iPhone 高端机型

#### isMobile - 移动端标识

```json
{
  "viewport": {
    "isMobile": true
  }
}
```

- **默认值**: false
- **作用**: 告知网站这是移动设备
- **影响**: 某些网站会根据此标识调整 UI 和响应式布局

#### hasTouch - 触摸支持

```json
{
  "viewport": {
    "hasTouch": true
  }
}
```

- **默认值**: false
- **作用**: 指示设备支持触摸事件
- **影响**: 网站可能禁用悬停效果，优化触摸交互

#### userAgent - 自定义 User-Agent

```json
{
  "viewport": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15..."
  }
}
```

- **默认值**: Chromium 默认值
- **作用**: 网站可能根据 User-Agent 返回不同内容
- **注意**: 需要完整的 User-Agent 字符串

获取真实 User-Agent：
1. 打开浏览器开发工具
2. 进入 Network 标签
3. 查看请求头中的 User-Agent

### 浏览器配置 (browser)

#### headless - 无头模式

```json
{
  "browser": {
    "headless": true
  }
}
```

- **默认值**: true
- **可选值**:
  - `true`: 无头模式（不显示浏览器窗口）
  - `false`: 有头模式（显示浏览器窗口，用于调试）

**何时改为 false**:
- 调试检测过程
- 观察网站加载行为
- 排查性能问题

#### timeout - 超时时间

```json
{
  "browser": {
    "timeout": 30000
  }
}
```

- **默认值**: 30000 毫秒（30 秒）
- **单位**: 毫秒
- **作用**: 页面导航的最大等待时间
- **推荐值**:
  - 30000: 一般网站
  - 60000: 复杂网站或慢速网络
  - 10000: 快速响应的 API

## 完整配置示例

### 示例 1: PC 桌面浏览

```json
{
  "viewport": {
    "width": 1920,
    "height": 1080,
    "deviceScaleFactor": 1,
    "isMobile": false,
    "hasTouch": false
  },
  "browser": {
    "headless": true,
    "timeout": 30000
  }
}
```

### 示例 2: iPhone 移动浏览

```json
{
  "viewport": {
    "width": 390,
    "height": 844,
    "deviceScaleFactor": 3,
    "isMobile": true,
    "hasTouch": true,
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
  },
  "browser": {
    "headless": true,
    "timeout": 30000
  }
}
```

### 示例 3: 最小配置

```json
{
  "viewport": {
    "width": 1440,
    "height": 900
  }
}
```

其他选项使用默认值。

### 示例 4: 慢速网络测试

```json
{
  "viewport": {
    "width": 393,
    "height": 851,
    "isMobile": true
  },
  "browser": {
    "timeout": 60000
  }
}
```

增加超时时间以适应慢速网络。

## 配置验证

### 启动时检查

运行 Monitor 工具时，会显示当前配置：

```
当前视口: 📱 移动端 (390x844)
```

### 查看检测结果

生成的检测报告 JSON 文件中会记录使用的配置：

```json
{
  "url": "https://example.com",
  "viewport": {
    "width": 390,
    "height": 844,
    "isMobile": true
  },
  "performanceMetrics": { ... }
}
```

## 常见配置组合

### 响应式设计测试

创建多个配置文件分别测试：

**mobile.json**:
```json
{
  "viewport": {
    "width": 390,
    "height": 844,
    "isMobile": true,
    "hasTouch": true
  }
}
```

**tablet.json**:
```json
{
  "viewport": {
    "width": 768,
    "height": 1024,
    "isMobile": true,
    "hasTouch": true
  }
}
```

**desktop.json**:
```json
{
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

### 跨浏览器测试

虽然 Monitor 使用 Chromium，但可以通过 User-Agent 模拟不同浏览器：

```json
{
  "viewport": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
}
```

## 故障排查

### Q: 配置文件没有被加载

**A**: 确保文件在项目根目录，名称为 `monitor.config.json`（区分大小写）。

### Q: 视口配置没有生效

**A**: 检查 `width` 和 `height` 是否都已指定（都是必需的）。

### Q: 超时时间设置无效

**A**: 超时时间是指导航超时，不是整个页面加载超时。如果网页包含延迟加载内容，可能仍需等待。

### Q: User-Agent 没有生效

**A**: 确保使用完整的 User-Agent 字符串，复制时不要遗漏任何部分。

## 配置最佳实践

1. **版本控制** - 将配置文件提交到 Git，团队共享配置
2. **文档化** - 在配置旁添加注释说明为何选择该配置
3. **多配置** - 为不同的测试场景创建不同的配置
4. **定期审查** - 确保配置与目标设备参数保持同步

## 相关文档

- [视口配置详解](./viewport-config.md)
- [Monitor 工具完整指南](../../MONITOR_README.md)
- [项目文档中心](../README.md)

---

**最后更新**: 2026-01-26
**维护者**: 项目团队
