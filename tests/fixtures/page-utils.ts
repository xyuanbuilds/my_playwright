import { Page } from "@playwright/test";

/**
 * 页面工具函数
 */

/**
 * 等待页面 UI 稳定（无 DOM 变化）
 *
 * @param page - Playwright Page 对象
 * @param options - 配置选项
 * @param options.stableDelay - 无变化持续时间，默认 5000ms（5秒）
 * @param options.maxWaitTime - 最大等待时间，默认 15000ms（15秒）
 * @returns 返回稳定原因：'ui_stable' 或 'max_wait_time_reached'
 *
 * @example
 * ```typescript
 * // 基本用法
 * await waitForUIStable(page);
 *
 * // 自定义等待时间
 * await waitForUIStable(page, { stableDelay: 3000, maxWaitTime: 10000 });
 *
 * // 检查稳定原因
 * const result = await waitForUIStable(page);
 * if (result === 'ui_stable') {
 *   console.log('UI 在指定时间内稳定');
 * } else {
 *   console.log('达到最大等待时间');
 * }
 * ```
 */
export async function waitForUIStable(
  page: Page,
  options?: {
    stableDelay?: number;
    maxWaitTime?: number;
  },
): Promise<"ui_stable" | "max_wait_time_reached"> {
  const stableDelay = options?.stableDelay ?? 5000;
  const maxWaitTime = options?.maxWaitTime ?? 15000;

  const result = await page.evaluate(
    ({ stableDelay, maxWaitTime }) => {
      return new Promise<"ui_stable" | "max_wait_time_reached">((resolve) => {
        let stableTimeoutId: number | undefined;
        let maxTimeoutId: number | undefined;
        const startTime = Date.now();
        let observer: MutationObserver | null = null;

        const cleanup = (reason: "ui_stable" | "max_wait_time_reached") => {
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          if (stableTimeoutId !== undefined) {
            clearTimeout(stableTimeoutId);
          }
          if (maxTimeoutId !== undefined) {
            clearTimeout(maxTimeoutId);
          }
          resolve(reason);
        };

        observer = new MutationObserver(() => {
          // 检查是否超过最大等待时间
          if (Date.now() - startTime > maxWaitTime) {
            cleanup("max_wait_time_reached");
            return;
          }

          // 每次 DOM 变化都重置计时器
          if (stableTimeoutId !== undefined) {
            clearTimeout(stableTimeoutId);
          }
          stableTimeoutId = window.setTimeout(() => {
            cleanup("ui_stable");
          }, stableDelay);
        });

        // 开始观察 DOM 变化
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });

        // 启动初始计时器
        stableTimeoutId = window.setTimeout(() => {
          cleanup("ui_stable");
        }, stableDelay);

        // 设置最大等待时间的兜底
        maxTimeoutId = window.setTimeout(() => {
          cleanup("max_wait_time_reached");
        }, maxWaitTime);
      });
    },
    { stableDelay, maxWaitTime },
  );

  return result;
}

/**
 * 等待页面 UI 稳定，并输出日志
 *
 * @param page - Playwright Page 对象
 * @param options - 配置选项
 * @param options.stableDelay - 无变化持续时间，默认 5000ms（5秒）
 * @param options.maxWaitTime - 最大等待时间，默认 15000ms（15秒）
 * @param options.logPrefix - 日志前缀，默认为空
 * @returns 返回稳定原因
 *
 * @example
 * ```typescript
 * await waitForUIStableWithLog(page, { logPrefix: '[步骤 6]' });
 * ```
 */
export async function waitForUIStableWithLog(
  page: Page,
  options?: {
    stableDelay?: number;
    maxWaitTime?: number;
    logPrefix?: string;
  },
): Promise<"ui_stable" | "max_wait_time_reached"> {
  const prefix = options?.logPrefix
    ? `${options.logPrefix} `
    : "[WaitForUIStable]";
  const stableDelay = options?.stableDelay ?? 5000;
  const maxWaitTime = options?.maxWaitTime ?? 15000;

  console.log(`${prefix}等待页面 UI 稳定...`);

  const result = await waitForUIStable(page, { stableDelay, maxWaitTime });

  const message =
    result === "ui_stable"
      ? `${stableDelay / 1000}秒无变化`
      : `达到最大等待时间 ${maxWaitTime / 1000}秒`;

  console.log(`${prefix}✅ 页面 UI 已稳定 (${message})`);

  return result;
}
