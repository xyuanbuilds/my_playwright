---
name: playwriter-video-recording
description: 使用 playwriter 进行屏幕录制。由于 playwriter 通过 CDP 连接到已有浏览器，无法使用 Playwright 原生 recordVideo，需使用截图序列 + ffmpeg 合成视频的方案。
---

## 背景

playwriter 通过 CDP (Chrome DevTools Protocol) 连接到用户已有的 Chrome 浏览器，这种模式下：
- 无法使用 `browser.newContext({ recordVideo: ... })` （browser 对象不可用）
- 无法使用 `context.newCDPSession()` 的 screencast 功能（CDP relay 限制）

**解决方案**：使用定时截图 + ffmpeg 合成视频

## 前置条件

确保已安装 ffmpeg：
```bash
brew install ffmpeg
```

## 重要限制

**playwriter 每次 `-e` 执行是独立的 VM 上下文**，`globalThis` 变量无法跨调用保持。因此：
- 不能在一个调用中启动录制，在另一个调用中停止
- 必须在**同一个 `-e` 调用中完成所有操作**（开始录制 → 执行操作 → 停止录制）

## 使用方法

### 单次调用完成录制（推荐）

将开始录制、操作、等待、停止录制放在同一个 `-e` 调用中：

```javascript
const fs = require('fs');
const path = require('path');

// 1. 创建帧目录
const videoDir = './videos';
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
const timestamp = Date.now();
const framesDir = path.join(videoDir, 'frames_' + timestamp);
fs.mkdirSync(framesDir, { recursive: true });

// 2. 开始定时截图 (5 FPS)
let frameIndex = 0;
let recording = true;
const captureFrame = async () => {
  if (!recording) return;
  try {
    const screenshotPath = path.join(framesDir, 'frame_' + String(frameIndex++).padStart(5, '0') + '.png');
    await page.screenshot({ path: screenshotPath });
  } catch (e) {}
  if (recording) setTimeout(captureFrame, 200);
};
captureFrame();
console.log('录制开始:', framesDir);

// 3. 执行你的操作
await page.locator('text=按钮').last().click();

// 4. 等待 UI 稳定
await page.evaluate(({ stableDelay, maxWaitTime }) => {
  return new Promise((resolve) => {
    let stableTimeoutId, maxTimeoutId;
    let observer = new MutationObserver(() => {
      clearTimeout(stableTimeoutId);
      stableTimeoutId = setTimeout(() => {
        observer.disconnect();
        clearTimeout(maxTimeoutId);
        resolve('ui_stable');
      }, stableDelay);
    });
    observer.observe(document.body, {
      childList: true, subtree: true, attributes: true, characterData: true
    });
    stableTimeoutId = setTimeout(() => {
      observer.disconnect();
      clearTimeout(maxTimeoutId);
      resolve('ui_stable');
    }, stableDelay);
    maxTimeoutId = setTimeout(() => {
      observer.disconnect();
      clearTimeout(stableTimeoutId);
      resolve('max_wait_time_reached');
    }, maxWaitTime);
  });
}, { stableDelay: 3000, maxWaitTime: 8000 });

// 5. 停止录制
recording = false;
console.log('录制停止，共', frameIndex, '帧');
console.log('帧目录:', framesDir);
```

### 合成视频

录制完成后，在终端中运行 ffmpeg：
```bash
# 将截图序列合成为 MP4 视频
ffmpeg -y -framerate 5 \
  -i ./videos/frames_<timestamp>/frame_%05d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 23 \
  ./videos/recording.mp4
```

参数说明：
- `-framerate 5`：输入帧率，与截图间隔 200ms 对应
- `-crf 23`：视频质量，数值越小质量越高（范围 0-51）
- `-pix_fmt yuv420p`：确保视频兼容性

## 完整示例

```bash
# 1. 确保有 playwriter session
playwriter session list

# 2. 在单次调用中完成录制（注意 --timeout 要足够长）
playwriter -s 1 --timeout 30000 -e "
const fs = require('fs');
const path = require('path');

// 创建帧目录
const videoDir = './videos';
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
const timestamp = Date.now();
const framesDir = path.join(videoDir, 'frames_' + timestamp);
fs.mkdirSync(framesDir, { recursive: true });

// 开始录制
let frameIndex = 0;
let recording = true;
const captureFrame = async () => {
  if (!recording) return;
  try {
    await page.screenshot({ path: path.join(framesDir, 'frame_' + String(frameIndex++).padStart(5, '0') + '.png') });
  } catch (e) {}
  if (recording) setTimeout(captureFrame, 200);
};
captureFrame();
console.log('录制开始:', framesDir);

// 执行操作
await page.locator('text=一方卡片').last().click();

// 等待 UI 稳定
await page.evaluate(({ stableDelay, maxWaitTime }) => {
  return new Promise((resolve) => {
    let tid, mtid;
    let obs = new MutationObserver(() => {
      clearTimeout(tid);
      tid = setTimeout(() => { obs.disconnect(); clearTimeout(mtid); resolve(); }, stableDelay);
    });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    tid = setTimeout(() => { obs.disconnect(); clearTimeout(mtid); resolve(); }, stableDelay);
    mtid = setTimeout(() => { obs.disconnect(); clearTimeout(tid); resolve(); }, maxWaitTime);
  });
}, { stableDelay: 3000, maxWaitTime: 8000 });

// 停止录制
recording = false;
console.log('录制停止，共 ' + frameIndex + ' 帧，目录:', framesDir);
"

# 3. 合成视频（替换 <timestamp> 为实际值）
ffmpeg -y -framerate 5 -i ./videos/frames_*/frame_%05d.png -c:v libx264 -pix_fmt yuv420p ./videos/recording.mp4
```

## 注意事项

1. **单次调用**：由于 VM 上下文隔离，必须在同一个 `-e` 调用中完成录制全流程
2. **超时设置**：使用 `--timeout` 参数确保有足够时间完成操作（默认 10 秒可能不够）
3. **帧率调整**：截图间隔 200ms = 5 FPS，可根据需要调整（100ms = 10 FPS）
4. **磁盘空间**：长时间录制会产生大量截图文件，注意磁盘空间
5. **清理帧文件**：视频合成后可删除帧目录节省空间
   ```bash
   rm -rf ./videos/frames_*
   ```
