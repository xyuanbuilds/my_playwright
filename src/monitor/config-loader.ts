/**
 * Monitor 配置加载器
 */

import { readJson } from '../utils/file-helper.js';
import type { MonitorConfig, ViewportConfig } from './types.js';
import path from 'path';

/**
 * 默认配置：PC 视口
 */
const DEFAULT_CONFIG: MonitorConfig = {
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  browser: {
    headless: true,
    timeout: 30000,
  },
};

/**
 * 加载 monitor 配置
 * 从项目根目录的 monitor.config.json 加载配置，如果不存在则使用默认配置
 */
export async function loadMonitorConfig(): Promise<MonitorConfig> {
  try {
    const configPath = path.join(process.cwd(), 'monitor.config.json');
    const userConfig = await readJson<Partial<MonitorConfig>>(configPath);

    if (!userConfig) {
      console.log('未找到配置文件，使用默认配置 (PC 视口)');
      return DEFAULT_CONFIG;
    }

    // 合并配置
    return {
      viewport: {
        ...DEFAULT_CONFIG.viewport,
        ...userConfig.viewport,
      },
      browser: {
        ...DEFAULT_CONFIG.browser,
        ...userConfig.browser,
      },
    };
  } catch (error) {
    console.warn('配置文件加载失败，使用默认配置:', error);
    return DEFAULT_CONFIG;
  }
}
