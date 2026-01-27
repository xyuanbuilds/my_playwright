import { Page, expect, Route, Request, Response } from "@playwright/test";
import { z } from "zod";

/**
 * URL 匹配模式配置
 */
export type UrlPattern =
  | string
  | RegExp
  | {
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      exact?: string;
      regex?: RegExp;
    };

/**
 * 命名 API 配置
 */
export interface NamedApiConfig {
  name: string;
  urlPattern: UrlPattern;
  method?: string;
  successStatusCodes?: number[];
  maxResponseTime?: number;
  responseSchema?: z.ZodSchema;
  responseValidator?: (body: any) => boolean | Promise<boolean>;
}

/**
 * API 调用记录
 */
export interface ApiCall {
  name?: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  requestBody?: any;
  responseBody?: any;
  contentType?: string;
  timestamp: number;
  error?: string;
  validationErrors?: string[];
}

/**
 * API 监控配置
 */
export interface ApiMonitorOptions {
  successStatusCodes?: number[];
  maxResponseTime?: number;
  validateJSON?: boolean;
  ignorePatterns?: RegExp[];
  criticalEndpoints?: RegExp[];
  trackRequestBody?: boolean;
  trackResponseBody?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<ApiMonitorOptions> = {
  successStatusCodes: [200, 201, 204, 304],
  maxResponseTime: 5000,
  validateJSON: true,
  ignorePatterns: [/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i],
  criticalEndpoints: [],
  trackRequestBody: false,
  trackResponseBody: true,
};

/**
 * API 监控器
 * 用于监控和验证 HTTP API 请求/响应
 */
export class ApiMonitor {
  private apiCalls: ApiCall[] = [];
  private namedApis: Map<string, NamedApiConfig> = new Map();
  private options: Required<ApiMonitorOptions>;
  private isTracking = false;

  constructor(private page: Page) {
    this.options = { ...DEFAULT_OPTIONS };
  }

  /**
   * 检查 URL 是否匹配指定模式
   */
  private matchesPattern(url: string, pattern: UrlPattern): boolean {
    if (typeof pattern === "string") {
      return url.includes(pattern);
    }

    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }

    // 对象模式
    if (pattern.contains) {
      return url.includes(pattern.contains);
    }
    if (pattern.startsWith) {
      return url.startsWith(pattern.startsWith);
    }
    if (pattern.endsWith) {
      return url.endsWith(pattern.endsWith);
    }
    if (pattern.exact) {
      return url === pattern.exact;
    }
    if (pattern.regex) {
      return pattern.regex.test(url);
    }

    return false;
  }

  /**
   * 检查 URL 是否应该被忽略
   */
  private shouldIgnore(url: string): boolean {
    return this.options.ignorePatterns.some((pattern) => pattern.test(url));
  }

  /**
   * 查找匹配的命名 API
   */
  private findMatchingApi(
    url: string,
    method: string
  ): NamedApiConfig | undefined {
    for (const [, config] of this.namedApis) {
      const urlMatches = this.matchesPattern(url, config.urlPattern);
      const methodMatches = !config.method || config.method === method;

      if (urlMatches && methodMatches) {
        return config;
      }
    }
    return undefined;
  }

  /**
   * 验证响应体
   */
  private async validateResponse(
    body: any,
    config?: NamedApiConfig
  ): Promise<string[]> {
    const errors: string[] = [];

    // 如果配置了 zod schema，进行验证
    if (config?.responseSchema) {
      try {
        config.responseSchema.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(
            `Schema validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
          );
        } else {
          errors.push(`Schema validation error: ${error}`);
        }
      }
    }

    // 如果配置了自定义验证器，执行验证
    if (config?.responseValidator) {
      try {
        const isValid = await config.responseValidator(body);
        if (!isValid) {
          errors.push("Custom validator returned false");
        }
      } catch (error) {
        errors.push(`Custom validator error: ${error}`);
      }
    }

    return errors;
  }

  /**
   * 开始追踪指定的命名 API
   */
  async track(
    configs: NamedApiConfig[],
    options?: Partial<ApiMonitorOptions>
  ): Promise<void> {
    // 合并配置
    if (options) {
      this.options = { ...this.options, ...options };
    }

    // 存储命名 API 配置
    configs.forEach((config) => {
      this.namedApis.set(config.name, config);
    });

    await this.start();
  }

  /**
   * 开始监控所有 HTTP 请求
   */
  async start(options?: Partial<ApiMonitorOptions>): Promise<void> {
    if (this.isTracking) {
      console.warn("⚠️  API 监控已在运行中");
      return;
    }

    // 合并配置
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.isTracking = true;
    this.apiCalls = [];

    // 拦截所有请求
    await this.page.route("**/*", async (route: Route) => {
      const request = route.request();
      const url = request.url();
      const method = request.method();

      // 检查是否应该忽略
      if (this.shouldIgnore(url)) {
        await route.continue();
        return;
      }

      const startTime = Date.now();
      let response: Response | null = null;
      let error: string | undefined;

      try {
        await route.continue();
        response = await request.response();
      } catch (err) {
        error = String(err);
      }

      const duration = Date.now() - startTime;
      const matchingApi = this.findMatchingApi(url, method);

      // 提取响应体
      let responseBody: any;
      let contentType: string | undefined;

      if (response) {
        try {
          contentType = response.headers()["content-type"];
          if (
            this.options.trackResponseBody &&
            contentType?.includes("application/json")
          ) {
            const text = await response.text();
            try {
              responseBody = JSON.parse(text);
            } catch {
              responseBody = text;
            }
          }
        } catch (err) {
          // 某些资源会被浏览器快速清理，这是正常的，不打印警告
          // 只在需要详细调试时取消注释
          // console.warn(`无法读取响应体: ${url}`, err);
        }
      }

      // 验证响应
      const validationErrors =
        responseBody && matchingApi
          ? await this.validateResponse(responseBody, matchingApi)
          : [];

      // 记录 API 调用
      const apiCall: ApiCall = {
        name: matchingApi?.name,
        url,
        method,
        status: response?.status() || 0,
        duration,
        responseBody,
        contentType,
        timestamp: startTime,
        error,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

      this.apiCalls.push(apiCall);
    });

    console.log("✅ API 监控已启动");
  }

  /**
   * 停止监控
   */
  async stop(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    await this.page.unroute("**/*");
    this.isTracking = false;
    console.log("🛑 API 监控已停止");
  }

  /**
   * 获取所有 API 调用记录
   */
  getAllCalls(): ApiCall[] {
    return [...this.apiCalls];
  }

  /**
   * 获取指定名称的 API 调用记录
   */
  getApiCalls(name: string): ApiCall[] {
    return this.apiCalls.filter((call) => call.name === name);
  }

  /**
   * 获取匹配 URL 模式的 API 调用记录
   */
  getCallsByUrl(pattern: UrlPattern): ApiCall[] {
    return this.apiCalls.filter((call) =>
      this.matchesPattern(call.url, pattern)
    );
  }

  /**
   * 验证指定 API 被调用
   */
  async expectApiCalled(name: string, times?: number): Promise<void> {
    const calls = this.getApiCalls(name);

    if (times !== undefined) {
      expect(
        calls.length,
        `API "${name}" 应该被调用 ${times} 次，实际调用了 ${calls.length} 次`
      ).toBe(times);
    } else {
      expect(
        calls.length,
        `API "${name}" 应该至少被调用一次`
      ).toBeGreaterThan(0);
    }
  }

  /**
   * 验证指定 API 调用成功
   */
  async expectApiSuccess(name: string): Promise<void> {
    const calls = this.getApiCalls(name);
    expect(calls.length, `未找到 API "${name}" 的调用记录`).toBeGreaterThan(
      0
    );

    const config = this.namedApis.get(name);
    const successCodes =
      config?.successStatusCodes || this.options.successStatusCodes;

    const failedCalls = calls.filter(
      (call) => !successCodes.includes(call.status) || call.error
    );

    if (failedCalls.length > 0) {
      const errorDetails = failedCalls
        .map(
          (call) =>
            `- ${call.url}: status ${call.status}${call.error ? `, error: ${call.error}` : ""}`
        )
        .join("\n");
      throw new Error(
        `API "${name}" 有 ${failedCalls.length} 次调用失败:\n${errorDetails}`
      );
    }
  }

  /**
   * 验证所有被追踪的 API
   */
  async validate(): Promise<void> {
    const errors: string[] = [];

    for (const [name, config] of this.namedApis) {
      const calls = this.getApiCalls(name);

      if (calls.length === 0) {
        errors.push(`❌ API "${name}" 未被调用`);
        continue;
      }

      const successCodes =
        config.successStatusCodes || this.options.successStatusCodes;
      const maxTime = config.maxResponseTime || this.options.maxResponseTime;

      calls.forEach((call, index) => {
        // 跳过状态码为 0 的请求（通常是被浏览器中止的请求）
        if (call.status === 0) {
          return;
        }

        // 验证状态码
        if (!successCodes.includes(call.status)) {
          errors.push(
            `❌ API "${name}" [${index + 1}] 状态码错误: ${call.status} (期望: ${successCodes.join(", ")})`
          );
        }

        // 验证响应时间
        if (call.duration > maxTime) {
          errors.push(
            `❌ API "${name}" [${index + 1}] 响应时间超时: ${call.duration}ms (最大: ${maxTime}ms)`
          );
        }

        // 验证响应内容
        if (call.validationErrors && call.validationErrors.length > 0) {
          errors.push(
            `❌ API "${name}" [${index + 1}] 验证失败: ${call.validationErrors.join("; ")}`
          );
        }

        // 验证错误
        if (call.error) {
          errors.push(
            `❌ API "${name}" [${index + 1}] 请求错误: ${call.error}`
          );
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`API 验证失败:\n${errors.join("\n")}`);
    }

    console.log(`✅ 所有 API 验证通过 (${this.namedApis.size} 个 API)`);
  }

  /**
   * 生成并打印报告
   * @param showAllCalls 是否显示所有 API 调用列表，默认为 false（仅显示命名 API）
   */
  async getReport(showAllCalls: boolean = false): Promise<void> {
    console.log("\n========== API 调用报告 ==========");
    console.log(`总调用数: ${this.apiCalls.length}`);
    console.log(`监控的命名 API: ${this.namedApis.size}`);

    if (this.namedApis.size > 0) {
      console.log("\n命名 API 统计:");
      for (const [name] of this.namedApis) {
        const calls = this.getApiCalls(name);
        const successCalls = calls.filter((c) =>
          this.options.successStatusCodes.includes(c.status)
        );
        const avgDuration =
          calls.length > 0
            ? calls.reduce((sum, c) => sum + c.duration, 0) / calls.length
            : 0;

        console.log(`\n  [${name}]`);
        console.log(`    调用次数: ${calls.length}`);
        console.log(`    成功次数: ${successCalls.length}`);
        console.log(`    平均响应时间: ${avgDuration.toFixed(2)}ms`);

        if (calls.length > 0) {
          console.log(`    最近调用: ${calls[calls.length - 1].url}`);
        }

        // 显示验证错误
        const callsWithErrors = calls.filter(
          (c) => c.validationErrors && c.validationErrors.length > 0
        );
        if (callsWithErrors.length > 0) {
          console.log(`    ⚠️  验证错误: ${callsWithErrors.length} 次`);
          callsWithErrors.forEach((call) => {
            console.log(`      - ${call.validationErrors?.join("; ")}`);
          });
        }

        // 显示该命名 API 的所有调用详情
        if (calls.length > 0) {
          console.log(`    调用详情:`);
          calls.forEach((call, index) => {
            const statusIcon = this.options.successStatusCodes.includes(call.status)
              ? "✅"
              : "❌";
            console.log(
              `      ${index + 1}. ${statusIcon} [${call.method}] ${call.url.substring(0, 70)}`
            );
            console.log(`         状态: ${call.status}, 耗时: ${call.duration}ms`);
          });
        }
      }
    }

    // 可选：显示所有 API 调用（简略）
    if (showAllCalls && this.apiCalls.length > 0) {
      console.log("\n所有 API 调用:");
      this.apiCalls.slice(0, 10).forEach((call, index) => {
        const statusIcon = this.options.successStatusCodes.includes(call.status)
          ? "✅"
          : "❌";
        console.log(
          `  ${index + 1}. ${statusIcon} [${call.method}] ${call.url.substring(0, 80)}`
        );
        console.log(`     状态: ${call.status}, 耗时: ${call.duration}ms`);
      });

      if (this.apiCalls.length > 10) {
        console.log(`  ... 还有 ${this.apiCalls.length - 10} 条记录`);
      }
    }

    console.log("====================================\n");
  }

  /**
   * 清除所有记录
   */
  clear(): void {
    this.apiCalls = [];
    this.namedApis.clear();
  }
}
