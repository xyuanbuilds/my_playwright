# 视口配置指南

Monitor 工具支持通过 `monitor.config.json` 配置文件自定义浏览器视口，支持 PC、移动端等多种预设配置。

## 概述

视口配置允许你在 Monitor 检测工具中模拟不同设备的浏览器环境，包括：
- 自定义视口尺寸（宽度、高度）
- 设备特性（移动端标识、触摸支持）
- 设备像素比
- 用户代理字符串

## 快速开始

### 1. 创建配置文件

在项目根目录创建 `monitor.config.json`：

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

### 2. 运行检测

```bash
pnpm run monitor
```

启动时会显示当前视口配置：
```
当前视口: 📱 移动端 (390x844)
```

### 3. 查看结果

检测结果会记录使用的视口信息，保存在 `detection-records/` 目录中。

## 配置项说明

### 视口配置 (viewport)

| 配置项 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|-------|------|
| `width` | number | ✅ | - | 视口宽度（像素） |
| `height` | number | ✅ | - | 视口高度（像素） |
| `deviceScaleFactor` | number | ❌ | 1 | 设备像素比 |
| `isMobile` | boolean | ❌ | false | 是否为移动端 |
| `hasTouch` | boolean | ❌ | false | 是否支持触摸 |
| `userAgent` | string | ❌ | - | 自定义 User-Agent |

## 配置示例

### PC 视口（默认）

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

**使用场景**: 桌面浏览器检测

### 移动端视口 - iPhone 12

```json
{
  "viewport": {
    "width": 390,
    "height": 844,
    "deviceScaleFactor": 3,
    "isMobile": true,
    "hasTouch": true,
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
  }
}
```

**使用场景**: iOS 设备检测

### 移动端视口 - Android Pixel 5

```json
{
  "viewport": {
    "width": 393,
    "height": 851,
    "deviceScaleFactor": 2.75,
    "isMobile": true,
    "hasTouch": true,
    "userAgent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36"
  }
}
```

**使用场景**: Android 设备检测

### 平板设备 - iPad

```json
{
  "viewport": {
    "width": 768,
    "height": 1024,
    "deviceScaleFactor": 2,
    "isMobile": true,
    "hasTouch": true
  }
}
```

**使用场景**: 平板设备检测

### 自定义尺寸

```json
{
  "viewport": {
    "width": 1440,
    "height": 900
  }
}
```

**使用场景**: 特定分辨率的笔记本电脑

## 设备参数参考

### 常见移动设备参数

| 设备 | 宽度 | 高度 | DPR | User-Agent 标识 |
|-----|------|------|-----|-----------------|
| iPhone 12 | 390 | 844 | 3 | iPhone |
| iPhone 13 | 390 | 844 | 3 | iPhone |
| Pixel 5 | 393 | 851 | 2.75 | Pixel |
| Galaxy S21 | 360 | 800 | 2 | Galaxy |
| iPad (9th) | 768 | 1024 | 2 | iPad |
| iPad Pro | 1024 | 1366 | 2 | iPad |

### 设备像素比（DPR）说明

- **DPR = 1**: 传统桌面屏幕
- **DPR = 2**: 大多数现代手机和平板
- **DPR = 3**: 高端手机（iPhone 等）
- **DPR = 2.75**: 某些 Pixel 手机

## 配置优先级

1. **配置文件值** - `monitor.config.json` 中明确指定的值
2. **默认值** - 未指定时使用默认值（PC 1920x1080）

## 默认配置

如果没有 `monitor.config.json` 文件，工具会使用：

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

## 检测结果中的视口记录

生成的检测报告会在 JSON 文件中记录视口信息：

```json
{
  "url": "https://example.com",
  "status": "success",
  "viewport": {
    "width": 390,
    "height": 844,
    "isMobile": true
  },
  "performanceMetrics": { ... },
  "resourceCheck": { ... }
}
```

## 实践建议

### 1. 响应式设计检测

创建多个配置文件分别检测不同断点：
- PC: 1920x1080
- Tablet: 768x1024
- Mobile: 390x844

### 2. 特定设备测试

使用真实设备的参数进行检测，确保兼容性。

### 3. 性能对比

在不同视口下进行相同网址的检测，比较性能差异：

```bash
# 先用 PC 视口检测
pnpm run monitor

# 修改配置为移动端
# 再次检测同一网址

# 对比两份报告的性能指标
```

### 4. 批量检测

修改配置后进行批量网址检测，获取不同视口下的性能数据。

## 常见问题

### Q: 如何快速切换视口配置？

**A**: 修改 `monitor.config.json` 中的 `viewport` 部分，重新运行 `pnpm run monitor`。

### Q: 设置的视口会影响截图尺寸吗？

**A**: 是的。生成的截图尺寸会根据配置的视口而变化。

### Q: User-Agent 如何设置？

**A**: 在 `userAgent` 字段中填写完整的 User-Agent 字符串。您可以从浏览器开发工具的网络标签中复制。

### Q: 自定义视口是否有尺寸限制？

**A**: 建议宽度和高度在 100-4000 像素之间，超出范围可能导致渲染问题。

## 相关文档

- [Monitor 工具配置](./monitor-config.md)
- [Monitor 工具完整指南](../../MONITOR_README.md)
- [检测结果格式说明](../../docs/README.md)

---

**最后更新**: 2026-01-26
**维护者**: 项目团队
