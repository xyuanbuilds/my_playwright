const { chromium } = require('@playwright/test');

// 微信 User-Agent
const WECHAT_UA = 'Mozilla/5.0 (Linux; Android 12; MI 11 Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 MicroMessenger/8.0.38.2400(0x28002657) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64';

// 目标 URL
const TARGET_URL = 'https://render.antgroup.com/p/yuyan/180020010001281523/agent.html?agent_id=202601AP9TEi09250838&user_id=111&channel=tbox_nologin&code=111&query=AI%20%E5%8D%A1%E7%89%87';

(async () => {
  console.log('🚀 启动微信场景深度调试...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    userAgent: WECHAT_UA,
    viewport: { width: 375, height: 812 },
  });

  const page = await context.newPage();

  console.log('📱 访问页面:', TARGET_URL);
  await page.goto(TARGET_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // 等待页面稳定
  console.log('⏳ 等待页面加载...');
  await page.waitForTimeout(5000);

  console.log('\n' + '='.repeat(80));
  console.log('🔍 开始深度分析...');
  console.log('='.repeat(80) + '\n');

  // 1. 基本页面信息
  const basicInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      readyState: document.readyState,
      bodyChildrenCount: document.body.children.length,
      totalElements: document.querySelectorAll('*').length,
    };
  });

  console.log('📄 基本信息:');
  console.log(JSON.stringify(basicInfo, null, 2));
  console.log();

  // 2. 检测前端框架和库
  const frameworks = await page.evaluate(() => {
    const detected = {
      react: !!(window.React || document.querySelector('[data-reactroot], [data-reactid]')),
      vue: !!(window.Vue || document.querySelector('[data-v-]')),
      angular: !!(window.angular || document.querySelector('[ng-app], [ng-version]')),
      jquery: !!window.jQuery,
      other: []
    };

    // 检测其他可能的框架
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) detected.other.push('React DevTools Hook');
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) detected.other.push('Vue DevTools Hook');

    return detected;
  });

  console.log('🎨 检测到的框架:');
  console.log(JSON.stringify(frameworks, null, 2));
  console.log();

  // 3. Shadow DOM 深度检测
  const shadowDomAnalysis = await page.evaluate(() => {
    const analysis = {
      openShadowRoots: [],
      possibleClosedShadowHosts: [],
      customElements: [],
      totalElements: 0
    };

    // 递归查找所有元素
    function analyzeElement(root, depth = 0) {
      const elements = root.querySelectorAll('*');
      analysis.totalElements += elements.length;

      elements.forEach((el) => {
        // 检测 open mode shadow DOM
        if (el.shadowRoot) {
          analysis.openShadowRoots.push({
            tagName: el.tagName.toLowerCase(),
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className : '',
            childCount: el.shadowRoot.childElementCount,
            innerHTML: el.shadowRoot.innerHTML?.substring(0, 300),
            depth
          });
          // 递归进入 shadow DOM
          analyzeElement(el.shadowRoot, depth + 1);
        }

        // 检测自定义元素（可能是 Web Components）
        if (el.tagName.includes('-')) {
          analysis.customElements.push({
            tagName: el.tagName.toLowerCase(),
            id: el.id || '',
            hasShadowRoot: !!el.shadowRoot,
            // 尝试检测 closed shadow root 的迹象
            possiblyHasClosedShadow: el.shadowRoot === null &&
                                     typeof el.attachShadow !== 'undefined'
          });
        }

        // 检测可能有 closed shadow root 的元素
        // closed shadow root 无法直接访问，但可以通过一些迹象判断
        if (el.shadowRoot === null &&
            typeof el.attachShadow !== 'undefined' &&
            el.children.length === 0 &&
            el.textContent &&
            el.textContent.trim() === '') {
          analysis.possibleClosedShadowHosts.push({
            tagName: el.tagName.toLowerCase(),
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className : ''
          });
        }
      });
    }

    analyzeElement(document);

    return {
      ...analysis,
      customElements: [...new Map(analysis.customElements.map(item =>
        [item.tagName, item])).values()], // 去重
      summary: {
        hasOpenShadowDOM: analysis.openShadowRoots.length > 0,
        openShadowRootCount: analysis.openShadowRoots.length,
        customElementTypes: analysis.customElements.length,
        possibleClosedShadowCount: analysis.possibleClosedShadowHosts.length
      }
    };
  });

  console.log('👤 Shadow DOM 分析:');
  console.log(JSON.stringify(shadowDomAnalysis.summary, null, 2));

  if (shadowDomAnalysis.openShadowRoots.length > 0) {
    console.log('\n✅ Open Shadow Roots 详情:');
    shadowDomAnalysis.openShadowRoots.forEach((root, index) => {
      console.log(`\n  [${index + 1}] ${root.tagName}`);
      console.log(`      ID: ${root.id || 'N/A'}`);
      console.log(`      Class: ${root.className || 'N/A'}`);
      console.log(`      Children: ${root.childCount}`);
      console.log(`      Content Preview: ${root.innerHTML?.substring(0, 100) || 'N/A'}...`);
    });
  }

  if (shadowDomAnalysis.customElements.length > 0) {
    console.log('\n🔧 自定义元素 (Web Components):');
    shadowDomAnalysis.customElements.forEach((el, index) => {
      console.log(`  [${index + 1}] ${el.tagName}`);
      console.log(`      Has Shadow Root: ${el.hasShadowRoot}`);
      console.log(`      Possibly Closed: ${el.possiblyHasClosedShadow}`);
    });
  }

  if (shadowDomAnalysis.possibleClosedShadowHosts.length > 0) {
    console.log('\n⚠️  可能使用 Closed Shadow DOM 的元素:');
    shadowDomAnalysis.possibleClosedShadowHosts.slice(0, 5).forEach((el, index) => {
      console.log(`  [${index + 1}] ${el.tagName} ${el.id ? '#' + el.id : ''} ${el.className ? '.' + el.className : ''}`);
    });
  }

  console.log();

  // 4. iframe 检测
  const iframeAnalysis = await page.evaluate(() => {
    const iframes = document.querySelectorAll('iframe');
    return {
      count: iframes.length,
      details: Array.from(iframes).map((iframe, index) => {
        const style = window.getComputedStyle(iframe);
        return {
          index: index + 1,
          src: iframe.src || '',
          id: iframe.id || '',
          name: iframe.name || '',
          sandbox: iframe.sandbox.value || 'none',
          width: iframe.width || style.width,
          height: iframe.height || style.height,
          display: style.display,
          visibility: style.visibility,
          zIndex: style.zIndex
        };
      })
    };
  });

  console.log('🖼️  iframe 分析:');
  console.log(`  总数: ${iframeAnalysis.count}`);
  if (iframeAnalysis.count > 0) {
    iframeAnalysis.details.forEach((iframe) => {
      console.log(`\n  [${iframe.index}]`);
      console.log(`      Src: ${iframe.src || 'empty'}`);
      console.log(`      ID: ${iframe.id || 'N/A'}`);
      console.log(`      Size: ${iframe.width} x ${iframe.height}`);
      console.log(`      Visible: ${iframe.display !== 'none' && iframe.visibility !== 'hidden'}`);
      console.log(`      Sandbox: ${iframe.sandbox}`);
    });
  }
  console.log();

  // 5. 检测特殊的隔离技术
  const isolationTech = await page.evaluate(() => {
    const tech = {
      hasIframes: document.querySelectorAll('iframe').length > 0,
      hasShadowDOM: !!document.querySelector('*[shadowroot]'),
      hasWebComponents: document.querySelectorAll('*').length > 0 &&
                       Array.from(document.querySelectorAll('*')).some(el => el.tagName.includes('-')),
      scopedStyles: document.querySelectorAll('style[scoped]').length,
      isolatedModules: !!document.querySelector('script[type="module"]'),
      contentSecurityPolicy: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || 'none'
    };
    return tech;
  });

  console.log('🔒 隔离技术检测:');
  console.log(JSON.stringify(isolationTech, null, 2));
  console.log();

  // 6. DOM 结构分析
  const domStructure = await page.evaluate(() => {
    const body = document.body;
    const children = Array.from(body.children).map(child => ({
      tagName: child.tagName.toLowerCase(),
      id: child.id || '',
      className: typeof child.className === 'string' ? child.className : '',
      childCount: child.children.length,
      hasContent: child.textContent ? child.textContent.trim().length > 0 : false
    }));

    return {
      directChildren: children.length,
      children: children.slice(0, 10) // 只显示前 10 个
    };
  });

  console.log('🌳 Body 直接子元素 (前10个):');
  domStructure.children.forEach((child, index) => {
    console.log(`  [${index + 1}] <${child.tagName}> ${child.id ? '#' + child.id : ''} ${child.className ? '.' + child.className.split(' ')[0] : ''}`);
    console.log(`      子元素数: ${child.childCount}, 有内容: ${child.hasContent}`);
  });
  console.log();

  // 7. 截图
  const screenshotPath = '/tmp/wechat-debug-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 已保存截图: ${screenshotPath}`);
  console.log();

  console.log('='.repeat(80));
  console.log('✅ 分析完成！');
  console.log('='.repeat(80));

  await browser.close();

})().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
