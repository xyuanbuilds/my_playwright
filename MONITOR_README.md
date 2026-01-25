# 网站自动化检测工具

这是一个基于 Playwright 的通用网站自动化检测工具，支持交互式命令行输入网址、批量检测、性能指标收集、资源完整性检查和自动截图。

## 功能特性

- **交互式命令行**：友好的命令行交互界面，支持逐个添加网址
- **批量检测**：一次性检测多个网址，自动生成汇总报告
- **性能指标收集**：
  - 页面加载时间（DOMContentLoaded、Load Complete）
  - 首字节时间（TTFB）
  - 首次内容绘制（FCP）
  - 最大内容绘制（LCP）
  - 网络请求统计
- **资源完整性检查**：
  - 检查所有资源加载状态（图片、CSS、JS、字体等）
  - 统计各类型资源数量
  - 记录失败的资源
- **自动截图**：全屏截图，按日期组织
- **结构化报告**：JSON 格式报告，易于解析和分析
- **错误处理**：完善的错误处理机制，检测失败不影响整体流程

## 目录结构

```
/Users/xy/Dev/my_playwright/
├── src/
│   ├── monitor/                        # 监测模块
│   │   ├── interactive-cli.ts          # 交互式入口
│   │   ├── detector.ts                 # 核心检测逻辑
│   │   ├── performance-collector.ts    # 性能指标收集
│   │   ├── resource-checker.ts         # 资源完整性检查
│   │   ├── screenshot-manager.ts       # 截图管理
│   │   ├── report-generator.ts         # 报告生成
│   │   └── types.ts                    # 类型定义
│   └── utils/                          # 工具函数
│       ├── date-helper.ts              # 日期格式化
│       └── file-helper.ts              # 文件操作
├── detection-records/                  # 检测记录（按日期）
│   └── YYYY-MM-DD/
│       ├── HHmmss-domain.json          # 单个网址检测结果
│       ├── HHmmss-batch-summary.json   # 批量检测汇总
│       └── index.json                  # 当日检测索引
└── detection-screenshots/              # 检测截图（按日期）
    └── YYYY-MM-DD/
        └── HHmmss-domain.png           # 截图文件
```

## 快速开始

### 1. 运行检测工具

```bash
pnpm run monitor
```

### 2. 使用流程

1. 工具启动后，会提示您输入网址
2. 输入完整的网址（包括 http:// 或 https://）
3. 按回车添加，继续输入下一个网址
4. 输入空行（直接按回车）完成添加
5. 确认是否开始检测
6. 等待检测完成，查看结果

### 3. 示例

```
欢迎使用网站检测工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请输入要检测的网址（输入空行完成添加）:
> https://example.com
✓ 已添加: https://example.com

请输入要检测的网址（输入空行完成添加）:
> https://github.com
✓ 已添加: https://github.com

请输入要检测的网址（输入空行完成添加）:
> [Enter 空行]

待检测网址列表 (2个):
  1. https://example.com
  2. https://github.com

是否开始检测? (Y/n) > Y

开始检测...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/2] ✓ https://example.com (1234ms)
[2/2] ✓ https://github.com (2345ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
检测完成！

报告路径: detection-records/2026-01-26/
汇总报告: 143052-batch-summary.json

统计信息:
  总计: 2 个网址
  成功: 2 个
  平均加载时间: 1789ms
  最快: https://example.com
  最慢: https://github.com
```

## 报告格式

### 单个网址检测结果

文件名：`HHmmss-domain.json`

```json
{
  "url": "https://example.com",
  "timestamp": "2026-01-26T14:30:52.123Z",
  "detectionTime": "143052",
  "status": "success",
  "httpStatus": 200,
  "loadTime": 2345,
  "performanceMetrics": {
    "navigationStart": 0,
    "domContentLoaded": 1234,
    "loadComplete": 2345,
    "timeToFirstByte": 156,
    "firstContentfulPaint": 890,
    "largestContentfulPaint": 1456,
    "totalRequests": 45,
    "totalSize": 1234567,
    "totalLoadTime": 2345
  },
  "resourceCheck": {
    "totalResources": 45,
    "failedResources": [],
    "resourcesByType": {
      "image": 12,
      "stylesheet": 5,
      "script": 18,
      "font": 3,
      "xhr": 5,
      "other": 2
    },
    "allResourcesLoaded": true
  },
  "screenshotPath": "detection-screenshots/2026-01-26/143052-example.com.png"
}
```

### 批量检测汇总报告

文件名：`HHmmss-batch-summary.json`

```json
{
  "batchId": "batch-20260126-143052",
  "timestamp": "2026-01-26T14:30:52.123Z",
  "totalUrls": 2,
  "successCount": 2,
  "failedCount": 0,
  "totalDetectionTime": 5678,
  "results": [
    {
      "url": "https://example.com",
      "status": "success",
      "loadTime": 2345,
      "httpStatus": 200,
      "detailPath": "detection-records/2026-01-26/143052-example.com.json"
    }
  ],
  "summary": {
    "averageLoadTime": 1789.5,
    "fastestUrl": "https://example.com",
    "slowestUrl": "https://github.com",
    "totalResourcesChecked": 90,
    "totalFailedResources": 0
  }
}
```

## 配置说明

当前检测配置：
- **超时时间**：30 秒（页面导航超时）
- **等待条件**：networkidle（网络空闲）
- **截图模式**：全屏截图
- **并发模式**：串行执行（批量检测时逐个进行）

## 注意事项

1. **网址格式**：必须包含协议（http:// 或 https://）
2. **超时处理**：单个网址检测超时不影响其他网址
3. **资源检测**：使用 Performance API，可能无法捕获所有失败资源
4. **截图失败**：截图失败不影响其他数据收集
5. **存储空间**：截图文件可能较大，注意磁盘空间

## 故障排查

### 检测失败

如果某个网址检测失败，报告中会包含错误信息：
- `navigation`: 网络错误或页面无法访问
- `timeout`: 超时错误
- `ssl`: SSL 证书错误
- `unknown`: 未知错误

### 查看详细日志

检测过程中的警告和错误会输出到控制台。

## 扩展建议

可以通过以下方式扩展工具：

1. **配置文件**：添加 config.json 支持自定义超时、并发数等参数
2. **多格式报告**：支持导出 CSV、HTML、Markdown 格式
3. **定时任务**：集成 cron 实现定时检测
4. **数据可视化**：生成性能趋势图表
5. **自定义检测规则**：支持自定义断言和检测逻辑
6. **通知功能**：检测完成后发送邮件或消息通知

## 技术栈

- Playwright 1.58.0 - 浏览器自动化
- @inquirer/prompts 8.0.0 - 交互式命令行
- chalk 5.6.2 - 终端彩色输出
- TypeScript 5.x - 类型安全
- Node.js 20+ - 运行环境

## 许可证

ISC
