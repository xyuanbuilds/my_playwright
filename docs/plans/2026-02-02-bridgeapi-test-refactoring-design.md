# BridgeAPI 测试重构设计

## 概述

将现有的 `bridge-api.spec.ts` 中的测试按 bridgeAPI 功能拆分成独立的测试文件，每个文件专注测试一个 bridgeAPI 在所有卡片类型上的表现。

## 目标

- 按 bridgeAPI 功能组织测试文件
- 提高测试的可维护性和可读性
- 支持独立运行单个 API 的所有测试
- 保持原文件作为参考

## 文件结构

```
tests/tbox/
├── bridge-api.spec.ts              (保留作为参考)
├── basic.spec.ts
├── websocket.spec.ts
├── domain.json
└── bridgeAPI/                      (新建文件夹)
    ├── sendQuery.spec.ts           (新建 - 发送消息测试)
    ├── openScheme.spec.ts          (新建 - 跳转外部页面测试)
    ├── openLocation.spec.ts        (新建 - 跳转地图页测试)
    └── makePhoneCall.spec.ts       (新建 - 拨打电话测试)
```

## 测试覆盖范围

### 卡片类型
- 一方卡片
- 三方卡片
- Paul卡片
- AI卡片

### BridgeAPI 功能
1. **sendQuery** - 发送消息，验证 WebSocket 消息收发
2. **openScheme** - 跳转外部页面，验证页面/弹窗打开
3. **openLocation** - 跳转地图页，验证高德地图页面打开
4. **makePhoneCall** - 拨打电话，验证 tel: scheme 调用

## 测试文件结构

每个测试文件遵循统一结构：

```typescript
// 1. 导入依赖
import { test, expect, waitForUIStableWithLog } from "../../fixtures";
import type { DomainsFile } from "../type";
import * as fs from "fs";
import * as path from "path";

// 2. 读取配置
const domainConfigPath = path.join(__dirname, "../domain.json");
const domainsData: DomainsFile = JSON.parse(
  fs.readFileSync(domainConfigPath, "utf-8")
);
const cardDomain = domainsData.domains.find((d) => d.name === "卡片综合");

// 3. 卡片类型定义
const CARD_TYPES = ["一方卡片", "三方卡片", "Paul卡片", "AI卡片"] as const;
type CardType = (typeof CARD_TYPES)[number];

// 4. 测试套件
test.describe("{API名称} - {功能描述}", () => {
  test.describe.configure({ mode: "serial" });

  CARD_TYPES.forEach((cardType) => {
    test(`${cardType} - {API名称} 功能`, async ({ page, myAgent, ...fixtures }) => {
      // 测试实现
    });
  });
});
```

## 路径调整

由于文件移到 `bridgeAPI/` 子文件夹：
- domain.json: `./domain.json` → `../domain.json`
- fixtures: `../fixtures` → `../../fixtures`
- type: `./type` → `../type`

## 实施步骤

1. 创建 `tests/tbox/bridgeAPI/` 文件夹
2. 从原文件提取 makePhoneCall 测试代码
3. 创建 `makePhoneCall.spec.ts` 并调整路径
4. 验证测试运行正常
5. 依次完成其他 3 个 API 的拆分
6. 保留原 `bridge-api.spec.ts` 文件

## 优势

1. **清晰的组织结构** - 所有 bridgeAPI 测试集中在专门文件夹
2. **独立运行** - 可以只运行某个 API 的测试：`pnpm test bridgeAPI/makePhoneCall`
3. **易于扩展** - 新增 bridgeAPI 直接在该文件夹新建文件
4. **代码复用** - 保留原文件作为参考，辅助函数可以提取为共享工具
5. **并行执行** - 不同 API 测试可以并行运行，提高效率
