import { test, expect } from '@playwright/test';

/**
 * H5 页面基础测试示例
 * 这个示例展示了如何测试移动端 H5 页面
 */

test.describe('H5 页面测试示例', () => {

  test('访问支付宝官网', async ({ page }) => {
    // 访问页面
    await page.goto('https://m.alipay.com');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page).toHaveTitle(/支付宝/);

    // 截图
    await page.screenshot({ path: 'screenshots/alipay-home.png', fullPage: true });
  });

  test('测试页面元素交互', async ({ page }) => {
    await page.goto('https://m.alipay.com');

    // 等待特定元素加载
    // await page.waitForSelector('.your-selector');

    // 点击元素示例
    // await page.click('.your-button');

    // 输入文本示例
    // await page.fill('input[name="username"]', '测试用户');

    // 验证元素是否可见
    // await expect(page.locator('.your-element')).toBeVisible();
  });

  test('测试移动端触摸事件', async ({ page }) => {
    await page.goto('https://m.alipay.com');

    // 模拟滚动
    await page.evaluate(() => window.scrollTo(0, 500));

    // 模拟触摸点击
    // await page.tap('.your-element');

    // 模拟滑动
    // await page.touchscreen.swipe({ x: 100, y: 200 }, { x: 100, y: 400 });
  });

  test('测试页面响应式布局', async ({ page }) => {
    // 设置不同的视口大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://m.alipay.com');

    // 验证移动端布局
    await page.screenshot({ path: 'screenshots/mobile-375.png' });

    // 切换到更大的屏幕
    await page.setViewportSize({ width: 414, height: 896 });
    await page.screenshot({ path: 'screenshots/mobile-414.png' });
  });

  test('测试网络请求', async ({ page }) => {
    // 监听网络请求
    page.on('request', request => {
      console.log('Request:', request.url());
    });

    page.on('response', response => {
      console.log('Response:', response.url(), response.status());
    });

    await page.goto('https://m.alipay.com');

    // 等待特定的 API 请求
    // const response = await page.waitForResponse(
    //   response => response.url().includes('/api/') && response.status() === 200
    // );
  });

  test('测试本地存储和 Cookie', async ({ page, context }) => {
    await page.goto('https://m.alipay.com');

    // 设置 localStorage
    await page.evaluate(() => {
      localStorage.setItem('test_key', 'test_value');
    });

    // 读取 localStorage
    const value = await page.evaluate(() => localStorage.getItem('test_key'));
    expect(value).toBe('test_value');

    // 获取 Cookie
    const cookies = await context.cookies();
    console.log('Cookies:', cookies);
  });
});
