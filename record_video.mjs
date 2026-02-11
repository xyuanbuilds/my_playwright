import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: {
      dir: './videos/',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  // 导航到页面
  console.log('正在打开页面...');
  await page.goto('https://render.antgroup.com/p/yuyan/180020010001281523/agent.html?agent_id=202601AP9TEi09250838&user_id=111&channel=tbox_nologin&code=111');
  await page.waitForTimeout(2000);
  
  // 点击一方卡片
  console.log('点击一方卡片...');
  await page.getByText('一方卡片').click();
  
  // 等待 UI 稳定
  console.log('等待 UI 稳定...');
  await page.waitForTimeout(3000);
  
  // 获取视频路径并关闭
  const videoPath = await page.video()?.path();
  console.log('视频路径:', videoPath);
  
  await page.close();
  await context.close();
  await browser.close();
  
  console.log('录制完成!');
}

main().catch(console.error);
