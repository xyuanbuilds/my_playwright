import { expect, Page } from "@playwright/test";

/**
 * URL Query 参数检测器
 * 用于验证和获取 URL 中的 query 参数
 */
export class URLQueryChecker {
  constructor(private page: Page) {}

  /**
   * 获取当前页面的所有 query 参数
   */
  async getQueryParams(): Promise<URLSearchParams> {
    const url = this.page.url();
    return new URL(url).searchParams;
  }

  /**
   * 获取所有 query 参数的对象形式
   */
  async getAllParams(): Promise<Record<string, string>> {
    const searchParams = await this.getQueryParams();
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * 获取指定的 query 参数值
   */
  async getParam(key: string): Promise<string | null> {
    const searchParams = await this.getQueryParams();
    return searchParams.get(key);
  }

  /**
   * 获取指定参数的所有值（支持同名参数）
   */
  async getAllParamValues(key: string): Promise<string[]> {
    const searchParams = await this.getQueryParams();
    return searchParams.getAll(key);
  }

  /**
   * 检查参数是否存在
   */
  async hasParam(key: string): Promise<boolean> {
    const searchParams = await this.getQueryParams();
    return searchParams.has(key);
  }

  /**
   * 验证参数存在
   */
  async expectParamExists(key: string): Promise<void> {
    const exists = await this.hasParam(key);
    expect(exists, `Query 参数 "${key}" 应该存在`).toBe(true);
  }

  /**
   * 验证参数不存在
   */
  async expectParamNotExists(key: string): Promise<void> {
    const exists = await this.hasParam(key);
    expect(exists, `Query 参数 "${key}" 不应该存在`).toBe(false);
  }

  /**
   * 验证参数值完全匹配
   */
  async expectParamEquals(key: string, expectedValue: string): Promise<void> {
    const actualValue = await this.getParam(key);
    expect(actualValue, `参数 "${key}" 的值应该是 "${expectedValue}"`).toBe(
      expectedValue
    );
  }

  /**
   * 验证参数值包含指定字符串
   */
  async expectParamContains(key: string, substring: string): Promise<void> {
    const value = await this.getParam(key);
    expect(value, `参数 "${key}" 应该存在且不为 null`).not.toBeNull();
    expect(
      value!.includes(substring),
      `参数 "${key}" 的值 "${value}" 应该包含 "${substring}"`
    ).toBe(true);
  }

  /**
   * 验证参数值匹配正则表达式
   */
  async expectParamMatches(key: string, pattern: RegExp): Promise<void> {
    const value = await this.getParam(key);
    expect(value, `参数 "${key}" 应该存在且不为 null`).not.toBeNull();
    expect(
      pattern.test(value!),
      `参数 "${key}" 的值 "${value}" 应该匹配正则 ${pattern}`
    ).toBe(true);
  }

  /**
   * 验证多个参数的值
   */
  async expectParams(expectedParams: Record<string, string>): Promise<void> {
    const allParams = await this.getAllParams();

    for (const [key, expectedValue] of Object.entries(expectedParams)) {
      expect(
        allParams[key],
        `参数 "${key}" 的值应该是 "${expectedValue}"，实际是 "${allParams[key]}"`
      ).toBe(expectedValue);
    }
  }

  /**
   * 验证参数包含指定的键值对（部分匹配）
   */
  async expectParamsContain(
    expectedParams: Record<string, string>
  ): Promise<void> {
    const allParams = await this.getAllParams();

    for (const [key, expectedValue] of Object.entries(expectedParams)) {
      expect(allParams, `应该包含参数 "${key}"`).toHaveProperty(key);
      expect(
        allParams[key],
        `参数 "${key}" 的值应该是 "${expectedValue}"`
      ).toBe(expectedValue);
    }
  }

  /**
   * 验证参数数量
   */
  async expectParamCount(expectedCount: number): Promise<void> {
    const params = await this.getAllParams();
    const actualCount = Object.keys(params).length;
    expect(
      actualCount,
      `Query 参数数量应该是 ${expectedCount}，实际是 ${actualCount}`
    ).toBe(expectedCount);
  }

  /**
   * 验证参数值为数字
   */
  async expectParamIsNumber(key: string): Promise<void> {
    const value = await this.getParam(key);
    expect(value, `参数 "${key}" 应该存在`).not.toBeNull();
    expect(
      !isNaN(Number(value)),
      `参数 "${key}" 的值 "${value}" 应该是数字`
    ).toBe(true);
  }

  /**
   * 验证参数值在指定范围内（数字）
   */
  async expectParamInRange(
    key: string,
    min: number,
    max: number
  ): Promise<void> {
    const value = await this.getParam(key);
    expect(value, `参数 "${key}" 应该存在`).not.toBeNull();

    const numValue = Number(value);
    expect(
      !isNaN(numValue),
      `参数 "${key}" 的值 "${value}" 应该是数字`
    ).toBe(true);
    expect(
      numValue,
      `参数 "${key}" 的值 ${numValue} 应该 >= ${min}`
    ).toBeGreaterThanOrEqual(min);
    expect(
      numValue,
      `参数 "${key}" 的值 ${numValue} 应该 <= ${max}`
    ).toBeLessThanOrEqual(max);
  }

  /**
   * 验证参数值是布尔值
   */
  async expectParamIsBoolean(key: string): Promise<void> {
    const value = await this.getParam(key);
    expect(value, `参数 "${key}" 应该存在`).not.toBeNull();
    expect(
      ["true", "false", "1", "0"].includes(value!.toLowerCase()),
      `参数 "${key}" 的值 "${value}" 应该是布尔值（true/false/1/0）`
    ).toBe(true);
  }

  /**
   * 打印当前所有 query 参数（用于调试）
   */
  async logAllParams(): Promise<void> {
    const params = await this.getAllParams();
    console.log("\n当前 URL:", this.page.url());
    console.log("Query 参数:");
    console.log(JSON.stringify(params, null, 2));
  }

  /**
   * 验证 URL 的 hash 部分
   */
  async getHash(): Promise<string> {
    const url = this.page.url();
    return new URL(url).hash;
  }

  /**
   * 验证 hash 值
   */
  async expectHash(expectedHash: string): Promise<void> {
    const hash = await this.getHash();
    expect(hash, `Hash 应该是 "${expectedHash}"`).toBe(expectedHash);
  }
}
