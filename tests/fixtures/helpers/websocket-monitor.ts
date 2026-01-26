import { Page, expect } from "@playwright/test";

/**
 * WebSocket 事件信息
 */
export interface WebSocketEvent {
  type: "open" | "close" | "error" | "message";
  timestamp: number;
  url?: string;
  data?: any;
  code?: number;
  reason?: string;
  error?: string;
}

/**
 * WebSocket 连接信息
 */
export interface WebSocketConnection {
  url: string;
  readyState: number;
  events: WebSocketEvent[];
  messages: any[];
  createdAt: number;
}

/**
 * WebSocket 监控器
 * 用于监控和验证 WebSocket 连接状态
 */
export class WebSocketMonitor {
  private connections: Map<string, WebSocketConnection> = new Map();
  private isMonitoring = false;

  constructor(private page: Page) {}

  /**
   * 开始监控 WebSocket 连接
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.warn("⚠️  WebSocket 监控已在运行中");
      return;
    }

    this.isMonitoring = true;
    this.connections.clear();

    // 注入监控脚本到页面
    await this.page.addInitScript(() => {
      // 保存原始 WebSocket 构造函数
      const OriginalWebSocket = window.WebSocket;

      // 创建 WebSocket 包装器
      (window as any).WebSocket = function (
        url: string,
        protocols?: string | string[]
      ) {
        const ws = new OriginalWebSocket(url, protocols);

        // 存储连接信息
        const connectionInfo = {
          url,
          readyState: ws.readyState,
          events: [],
          messages: [],
          createdAt: Date.now(),
        };

        // 保存到全局对象
        if (!(window as any).__wsConnections) {
          (window as any).__wsConnections = new Map();
        }
        (window as any).__wsConnections.set(url, connectionInfo);

        // 监听 open 事件
        ws.addEventListener("open", (event) => {
          connectionInfo.events.push({
            type: "open",
            timestamp: Date.now(),
            url,
          });
          connectionInfo.readyState = ws.readyState;
          console.log(`[WebSocket] Connected: ${url}`);
        });

        // 监听 message 事件
        ws.addEventListener("message", (event) => {
          const data =
            typeof event.data === "string"
              ? event.data
              : "[Binary Data]";
          connectionInfo.events.push({
            type: "message",
            timestamp: Date.now(),
            data,
          });
          connectionInfo.messages.push(data);
          console.log(`[WebSocket] Message received from ${url}:`, data);
        });

        // 监听 close 事件
        ws.addEventListener("close", (event) => {
          connectionInfo.events.push({
            type: "close",
            timestamp: Date.now(),
            code: event.code,
            reason: event.reason,
          });
          connectionInfo.readyState = ws.readyState;
          console.log(`[WebSocket] Closed: ${url}, code: ${event.code}`);
        });

        // 监听 error 事件
        ws.addEventListener("error", (event) => {
          connectionInfo.events.push({
            type: "error",
            timestamp: Date.now(),
            error: "WebSocket error occurred",
          });
          console.error(`[WebSocket] Error: ${url}`);
        });

        return ws;
      };

      // 复制静态属性
      (window as any).WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
      (window as any).WebSocket.OPEN = OriginalWebSocket.OPEN;
      (window as any).WebSocket.CLOSING = OriginalWebSocket.CLOSING;
      (window as any).WebSocket.CLOSED = OriginalWebSocket.CLOSED;
    });

    console.log("✅ WebSocket 监控已启动");
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("🛑 WebSocket 监控已停止");
  }

  /**
   * 获取所有 WebSocket 连接信息
   */
  async getAllConnections(): Promise<Map<string, WebSocketConnection>> {
    const connections = await this.page.evaluate(() => {
      const wsConnections = (window as any).__wsConnections;
      if (!wsConnections) return {};

      const result: Record<string, any> = {};
      wsConnections.forEach((value: any, key: string) => {
        result[key] = value;
      });
      return result;
    });

    this.connections.clear();
    Object.entries(connections).forEach(([url, info]) => {
      this.connections.set(url, info as WebSocketConnection);
    });

    return this.connections;
  }

  /**
   * 获取特定 URL 的连接信息
   */
  async getConnection(url: string): Promise<WebSocketConnection | null> {
    await this.getAllConnections();
    return this.connections.get(url) || null;
  }

  /**
   * 等待 WebSocket 连接建立
   */
  async waitForConnection(
    urlPattern: string | RegExp,
    timeout = 10000
  ): Promise<WebSocketConnection> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      await this.getAllConnections();

      for (const [url, conn] of this.connections.entries()) {
        const matches =
          typeof urlPattern === "string"
            ? url.includes(urlPattern)
            : urlPattern.test(url);

        if (matches) {
          const hasOpenEvent = conn.events.some((e) => e.type === "open");
          if (hasOpenEvent) {
            console.log(`✅ WebSocket 连接已建立: ${url}`);
            return conn;
          }
        }
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(
      `等待 WebSocket 连接超时: ${urlPattern} (${timeout}ms)`
    );
  }

  /**
   * 等待接收消息
   */
  async waitForMessage(
    urlPattern: string | RegExp,
    messagePattern?: string | RegExp,
    timeout = 10000
  ): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      await this.getAllConnections();

      for (const [url, conn] of this.connections.entries()) {
        const urlMatches =
          typeof urlPattern === "string"
            ? url.includes(urlPattern)
            : urlPattern.test(url);

        if (urlMatches && conn.messages.length > 0) {
          // 如果没有指定消息模式，返回最新消息
          if (!messagePattern) {
            return conn.messages[conn.messages.length - 1];
          }

          // 检查是否有匹配的消息
          for (const msg of conn.messages) {
            const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
            const msgMatches =
              typeof messagePattern === "string"
                ? msgStr.includes(messagePattern)
                : messagePattern.test(msgStr);

            if (msgMatches) {
              console.log(`✅ 收到匹配的消息: ${msgStr}`);
              return msgStr;
            }
          }
        }
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(`等待 WebSocket 消息超时: ${timeout}ms`);
  }

  /**
   * 验证 WebSocket 已连接
   */
  async expectConnected(urlPattern: string | RegExp): Promise<void> {
    await this.getAllConnections();

    let found = false;
    for (const [url, conn] of this.connections.entries()) {
      const matches =
        typeof urlPattern === "string"
          ? url.includes(urlPattern)
          : urlPattern.test(url);

      if (matches) {
        const hasOpenEvent = conn.events.some((e) => e.type === "open");
        expect(
          hasOpenEvent,
          `WebSocket 应该已连接: ${url}`
        ).toBe(true);
        found = true;
        break;
      }
    }

    expect(found, `未找到匹配的 WebSocket 连接: ${urlPattern}`).toBe(
      true
    );
  }

  /**
   * 验证 WebSocket 已关闭
   */
  async expectClosed(urlPattern: string | RegExp): Promise<void> {
    await this.getAllConnections();

    for (const [url, conn] of this.connections.entries()) {
      const matches =
        typeof urlPattern === "string"
          ? url.includes(urlPattern)
          : urlPattern.test(url);

      if (matches) {
        const hasCloseEvent = conn.events.some((e) => e.type === "close");
        expect(
          hasCloseEvent,
          `WebSocket 应该已关闭: ${url}`
        ).toBe(true);
        return;
      }
    }

    // 如果没找到连接，也算作已关闭
    console.log(`未找到 WebSocket 连接，视为已关闭: ${urlPattern}`);
  }

  /**
   * 验证收到了消息
   */
  async expectMessageReceived(
    urlPattern: string | RegExp,
    messagePattern?: string | RegExp
  ): Promise<void> {
    await this.getAllConnections();

    for (const [url, conn] of this.connections.entries()) {
      const urlMatches =
        typeof urlPattern === "string"
          ? url.includes(urlPattern)
          : urlPattern.test(url);

      if (urlMatches) {
        expect(
          conn.messages.length,
          `应该收到至少一条消息: ${url}`
        ).toBeGreaterThan(0);

        if (messagePattern) {
          const hasMatchingMessage = conn.messages.some((msg) => {
            const msgStr = typeof msg === "string" ? msg : JSON.stringify(msg);
            return typeof messagePattern === "string"
              ? msgStr.includes(messagePattern)
              : messagePattern.test(msgStr);
          });

          expect(
            hasMatchingMessage,
            `应该收到匹配的消息: ${messagePattern}`
          ).toBe(true);
        }
        return;
      }
    }

    throw new Error(`未找到匹配的 WebSocket 连接: ${urlPattern}`);
  }

  /**
   * 获取连接数量
   */
  async getConnectionCount(): Promise<number> {
    await this.getAllConnections();
    return this.connections.size;
  }

  /**
   * 获取所有消息
   */
  async getAllMessages(urlPattern?: string | RegExp): Promise<any[]> {
    await this.getAllConnections();

    const allMessages: any[] = [];

    for (const [url, conn] of this.connections.entries()) {
      if (!urlPattern) {
        allMessages.push(...conn.messages);
      } else {
        const matches =
          typeof urlPattern === "string"
            ? url.includes(urlPattern)
            : urlPattern.test(url);

        if (matches) {
          allMessages.push(...conn.messages);
        }
      }
    }

    return allMessages;
  }

  /**
   * 打印连接报告
   */
  async logReport(): Promise<void> {
    await this.getAllConnections();

    console.log("\n========== WebSocket 连接报告 ==========");
    console.log(`总连接数: ${this.connections.size}`);

    if (this.connections.size === 0) {
      console.log("未检测到 WebSocket 连接");
    } else {
      this.connections.forEach((conn, url) => {
        console.log(`\n[连接] ${url}`);
        console.log(`  创建时间: ${new Date(conn.createdAt).toISOString()}`);
        console.log(`  事件数: ${conn.events.length}`);
        console.log(`  消息数: ${conn.messages.length}`);

        const openEvent = conn.events.find((e) => e.type === "open");
        const closeEvent = conn.events.find((e) => e.type === "close");
        const errorEvents = conn.events.filter((e) => e.type === "error");

        if (openEvent) {
          console.log(`  ✅ 已连接 (${new Date(openEvent.timestamp).toISOString()})`);
        }
        if (closeEvent) {
          console.log(
            `  ❌ 已关闭 (code: ${closeEvent.code}, reason: ${closeEvent.reason || "无"})`
          );
        }
        if (errorEvents.length > 0) {
          console.log(`  ⚠️  错误数: ${errorEvents.length}`);
        }

        if (conn.messages.length > 0) {
          console.log(`  最新消息: ${conn.messages[conn.messages.length - 1]}`);
        }
      });
    }
    console.log("========================================\n");
  }

  /**
   * 清除所有连接信息
   */
  clear(): void {
    this.connections.clear();
  }
}
