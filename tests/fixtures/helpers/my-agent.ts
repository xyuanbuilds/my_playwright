import type { Page, Locator } from "@playwright/test";

/**
 * MyAgent 配置选项
 */
export interface MyAgentOptions {
  /** 自定义输入框选择器列表 */
  inputSelectors?: string[];
  /** 发送消息后的等待时间（毫秒） */
  waitAfterSend?: number;
}

/**
 * MyAgent - 智能体对话页面操作助手
 * 用于简化与智能体对话页面的交互操作
 */
export class MyAgent {
  private page: Page;
  private inputSelectors: string[];
  private waitAfterSend: number;

  /** 默认的输入框选择器列表 */
  private static readonly DEFAULT_SELECTORS = [
    'input[type="text"]',
    'input[placeholder*="输入"]',
    'input[placeholder*="问"]',
    'input[enterkeyhint*="send"]',
    "textarea",
  ];

  /**
   * 判断元素是否是聊天消息（即不在 preloadList 和 historyWrapper 容器内）
   * 此函数设计用于在 page.evaluate() 中使用
   *
   * @example
   * ```typescript
   * const result = await page.evaluate(
   *   (isChatMsgFn) => {
   *     const isChatMsg = new Function(`return (${isChatMsgFn})`)();
   *     const iframe = document.querySelector('iframe');
   *     return isChatMsg(iframe);
   *   },
   *   MyAgent.isChatMsg.toString()
   * );
   * ```
   */
  static isChatMsg(element: Element | null): boolean {
    if (!element) return false;

    let current: Element | null = element;
    while (current && current !== document.body) {
      if (
        current.className &&
        typeof current.className === "string"
      ) {
        // 如果在 preloadList 或 historyWrapper 中，都不是聊天消息
        if (
          current.className.includes("preloadList") ||
          current.className.includes("historyWrapper")
        ) {
          return false;
        }
      }
      current = current.parentElement;
    }
    return true; // 既不在 preloadList 也不在 historyWrapper 中，是聊天消息
  }

  /**
   * 判断元素是否在历史消息容器中（即在 historyWrapper 容器内）
   * 此函数设计用于在 page.evaluate() 中使用
   *
   * @example
   * ```typescript
   * const result = await page.evaluate(
   *   (isHistoryFn) => {
   *     const isHistory = new Function(`return (${isHistoryFn})`)();
   *     const element = document.querySelector('.message');
   *     return isHistory(element);
   *   },
   *   MyAgent.isHistory.toString()
   * );
   * ```
   */
  static isHistory(element: Element | null): boolean {
    if (!element) return false;

    let current: Element | null = element;
    while (current && current !== document.body) {
      if (
        current.className &&
        typeof current.className === "string" &&
        current.className.includes("historyWrapper")
      ) {
        return true; // 在 historyWrapper 中，是历史消息
      }
      current = current.parentElement;
    }
    return false; // 不在 historyWrapper 中，不是历史消息
  }

  /**
   * 判断元素是否在预加载历史容器中（即在 preloadList 容器内）
   * 此函数设计用于在 page.evaluate() 中使用
   *
   * @example
   * ```typescript
   * const result = await page.evaluate(
   *   (isPreLoadHistoryFn) => {
   *     const isPreLoadHistory = new Function(`return (${isPreLoadHistoryFn})`)();
   *     const element = document.querySelector('.message');
   *     return isPreLoadHistory(element);
   *   },
   *   MyAgent.isPreLoadHistory.toString()
   * );
   * ```
   */
  static isPreLoadHistory(element: Element | null): boolean {
    if (!element) return false;

    let current: Element | null = element;
    while (current && current !== document.body) {
      if (
        current.className &&
        typeof current.className === "string" &&
        current.className.includes("preloadList")
      ) {
        return true; // 在 preloadList 中，是预加载历史
      }
      current = current.parentElement;
    }
    return false; // 不在 preloadList 中，不是预加载历史
  }

  constructor(page: Page, options: MyAgentOptions = {}) {
    this.page = page;
    this.inputSelectors = options.inputSelectors || MyAgent.DEFAULT_SELECTORS;
    this.waitAfterSend = options.waitAfterSend ?? 500;
  }

  /**
   * 设置自定义输入框选择器
   * @param selectors 选择器数组
   */
  setInputSelectors(selectors: string[]): void {
    this.inputSelectors = selectors;
  }

  /**
   * 检查元素是否是聊天消息（不在 preloadList 和 historyWrapper 中）
   * @param locator 要检查的元素定位器
   * @returns 是否是聊天消息
   */
  async isChatMsgElement(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el) => {
      let current: Element | null = el;
      while (current && current !== document.body) {
        if (current.className && typeof current.className === "string") {
          if (
            current.className.includes("preloadList") ||
            current.className.includes("historyWrapper")
          ) {
            return false;
          }
        }
        current = current.parentElement;
      }
      return true;
    });
  }

  /**
   * 检查元素是否在历史消息容器中
   * @param locator 要检查的元素定位器
   * @returns 是否在历史消息容器中
   */
  async isHistoryElement(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el) => {
      let current: Element | null = el;
      while (current && current !== document.body) {
        if (
          current.className &&
          typeof current.className === "string" &&
          current.className.includes("historyWrapper")
        ) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
  }

  /**
   * 检查元素是否在预加载历史容器中
   * @param locator 要检查的元素定位器
   * @returns 是否在预加载历史容器中
   */
  async isPreLoadHistoryElement(locator: Locator): Promise<boolean> {
    return await locator.evaluate((el) => {
      let current: Element | null = el;
      while (current && current !== document.body) {
        if (
          current.className &&
          typeof current.className === "string" &&
          current.className.includes("preloadList")
        ) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
  }

  /**
   * 查找输入框
   * @returns 找到的输入框 Locator，如果未找到则抛出错误
   */
  async findInput(): Promise<Locator> {
    for (const selector of this.inputSelectors) {
      const element = this.page.locator(selector).first();
      const count = await element.count();

      if (count > 0 && (await element.isVisible())) {
        console.log(`✅ 找到输入框: ${selector}`);
        return element;
      }
    }

    throw new Error(
      `找不到输入框，已尝试的选择器: ${this.inputSelectors.join(", ")}`,
    );
  }

  /**
   * 发送消息
   * @param message 要发送的消息内容
   */
  async send(message: string): Promise<void> {
    console.log(`📤 发送消息: ${message}`);

    // 查找输入框
    const input = await this.findInput();

    // 填充内容
    await input.fill(message);

    // 等待输入完成
    await this.page.waitForTimeout(this.waitAfterSend);

    // 按 Enter 发送
    await input.press("Enter");

    console.log("✅ 消息已发送");
  }
}
