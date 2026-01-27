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

  constructor(page: Page, options: MyAgentOptions = {}) {
    this.page = page;
    this.inputSelectors = options.inputSelectors || MyAgent.DEFAULT_SELECTORS;
    this.waitAfterSend = options.waitAfterSend ?? 500;
  }

  /**
   * 设置自定义输入框选择器
   * @param selectors 选择器数组
   */
  setSelectors(selectors: string[]): void {
    this.inputSelectors = selectors;
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
