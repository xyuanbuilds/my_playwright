import { Page } from "@playwright/test";

/**
 * 页面性能监控器
 * 用于监控和分析页面加载性能
 */
export class PerformanceMonitor {
  private metrics: {
    requests: { url: string; method: string; resourceType: string }[];
    responses: { url: string; status: number; timing?: any }[];
    startTime: number;
  };

  constructor(private page: Page) {
    this.metrics = {
      requests: [],
      responses: [],
      startTime: Date.now(),
    };
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    this.metrics.startTime = Date.now();
    this.metrics.requests = [];
    this.metrics.responses = [];

    this.page.on("request", (request) => {
      this.metrics.requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    this.page.on("response", async (response) => {
      const responseData: any = {
        url: response.url(),
        status: response.status(),
      };

      // timing 方法可能不存在或是异步的，需要安全地获取
      try {
        if (typeof (response as any).timing === 'function') {
          responseData.timing = await (response as any).timing();
        }
      } catch (error) {
        // 忽略 timing 错误
      }

      this.metrics.responses.push(responseData);
    });
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.metrics.startTime = Date.now();
    this.metrics.requests = [];
    this.metrics.responses = [];
  }

  /**
   * 获取性能报告
   */
  async getReport(): Promise<{
    totalRequests: number;
    totalResponses: number;
    failedRequests: number;
    loadTime: number;
    performanceMetrics?: any;
  }> {
    const loadTime = Date.now() - this.metrics.startTime;
    const failedRequests = this.metrics.responses.filter(
      (r) => r.status >= 400
    ).length;

    // 获取浏览器性能指标
    const performanceMetrics = await this.page
      .evaluate(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        if (!navigation) return null;

        return {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          domParsing: navigation.domInteractive - navigation.responseEnd,
          domReady:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        };
      })
      .catch(() => null);

    return {
      totalRequests: this.metrics.requests.length,
      totalResponses: this.metrics.responses.length,
      failedRequests,
      loadTime,
      performanceMetrics,
    };
  }

  /**
   * 打印性能报告
   */
  async logReport(): Promise<void> {
    const report = await this.getReport();

    console.log("\n========== 性能监控报告 ==========");
    console.log(`总请求数: ${report.totalRequests}`);
    console.log(`总响应数: ${report.totalResponses}`);
    console.log(`失败请求: ${report.failedRequests}`);
    console.log(`页面加载时间: ${report.loadTime}ms`);

    if (report.performanceMetrics) {
      console.log("\n浏览器性能指标:");
      console.log(`  DNS 查询: ${report.performanceMetrics.dns.toFixed(2)}ms`);
      console.log(`  TCP 连接: ${report.performanceMetrics.tcp.toFixed(2)}ms`);
      console.log(
        `  请求时间: ${report.performanceMetrics.request.toFixed(2)}ms`
      );
      console.log(
        `  响应时间: ${report.performanceMetrics.response.toFixed(2)}ms`
      );
      console.log(
        `  DOM 解析: ${report.performanceMetrics.domParsing.toFixed(2)}ms`
      );
      console.log(
        `  DOM Ready: ${report.performanceMetrics.domReady.toFixed(2)}ms`
      );
      console.log(
        `  Load 完成: ${report.performanceMetrics.loadComplete.toFixed(2)}ms`
      );
    }
    console.log("====================================\n");
  }

  /**
   * 获取失败的请求列表
   */
  getFailedRequests(): { url: string; status: number }[] {
    return this.metrics.responses.filter((r) => r.status >= 400);
  }

  /**
   * 获取成功的请求列表
   */
  getSuccessfulRequests(): { url: string; status: number }[] {
    return this.metrics.responses.filter(
      (r) => r.status >= 200 && r.status < 400
    );
  }

  /**
   * 按资源类型统计请求
   */
  getRequestsByType(): Record<string, number> {
    return this.metrics.requests.reduce(
      (acc, req) => {
        acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  /**
   * 按状态码统计响应
   */
  getResponsesByStatus(): Record<number, number> {
    return this.metrics.responses.reduce(
      (acc, res) => {
        acc[res.status] = (acc[res.status] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
  }

  /**
   * 获取所有请求
   */
  getAllRequests(): { url: string; method: string; resourceType: string }[] {
    return this.metrics.requests;
  }

  /**
   * 获取所有响应
   */
  getAllResponses(): { url: string; status: number; timing?: any }[] {
    return this.metrics.responses;
  }

  /**
   * 获取特定类型的请求
   */
  getRequestsByResourceType(type: string): string[] {
    return this.metrics.requests
      .filter((req) => req.resourceType === type)
      .map((req) => req.url);
  }

  /**
   * 获取特定域名的请求
   */
  getRequestsByDomain(domain: string): string[] {
    return this.metrics.requests
      .filter((req) => req.url.includes(domain))
      .map((req) => req.url);
  }
}
