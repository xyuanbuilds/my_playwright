#!/usr/bin/env node

/**
 * 交互式命令行入口
 */

import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { detectBatch } from './detector.js';
import { saveSingleResult, generateBatchSummary } from './report-generator.js';
import { formatDate, formatTime } from '../utils/date-helper.js';
import { isValidUrl } from '../utils/file-helper.js';

async function main() {
  console.log(chalk.cyan.bold('\n欢迎使用网站检测工具'));
  console.log(chalk.cyan('━'.repeat(40)));

  const urls: string[] = [];

  while (true) {
    try {
      const url = await input({
        message: '请输入要检测的网址（输入空行完成添加）:',
      });

      if (!url.trim()) {
        break;
      }

      if (isValidUrl(url)) {
        urls.push(url);
        console.log(chalk.green(`✓ 已添加: ${url}`));
      } else {
        console.log(chalk.red('✗ 无效的 URL 格式，请重新输入'));
      }
    } catch (error: any) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.yellow('\n\n已取消'));
        process.exit(0);
      }
      throw error;
    }
  }

  if (urls.length === 0) {
    console.log(chalk.yellow('未添加任何网址'));
    return;
  }

  console.log(chalk.cyan(`\n待检测网址列表 (${urls.length}个):`));
  urls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));

  try {
    const shouldContinue = await confirm({
      message: '是否开始检测?',
      default: true,
    });

    if (!shouldContinue) {
      console.log(chalk.yellow('已取消检测'));
      return;
    }
  } catch (error: any) {
    if (error.name === 'ExitPromptError') {
      console.log(chalk.yellow('\n\n已取消'));
      process.exit(0);
    }
    throw error;
  }

  console.log(chalk.cyan('\n开始检测...'));
  console.log(chalk.cyan('━'.repeat(40)));

  const results = await detectBatch(urls);

  const date = formatDate(new Date());
  const timestamp = formatTime(new Date());

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const progressText = `[${i + 1}/${urls.length}]`;

    if (result.status === 'success') {
      console.log(
        chalk.green(`${progressText} ✓ ${result.url} (${result.loadTime}ms)`)
      );
    } else {
      console.log(
        chalk.red(`${progressText} ✗ ${result.url} (${result.error})`)
      );
    }

    await saveSingleResult(result, date);
  }

  const summary = await generateBatchSummary(results, date, timestamp);

  console.log(chalk.cyan('\n━'.repeat(40)));
  console.log(chalk.green.bold('检测完成！'));
  console.log(chalk.cyan(`\n报告路径: detection-records/${date}/`));
  console.log(chalk.cyan(`汇总报告: ${timestamp}-batch-summary.json`));

  console.log(chalk.cyan('\n统计信息:'));
  console.log(`  总计: ${summary.totalUrls} 个网址`);
  console.log(chalk.green(`  成功: ${summary.successCount} 个`));
  if (summary.failedCount > 0) {
    console.log(chalk.red(`  失败: ${summary.failedCount} 个`));
  }

  if (summary.summary.averageLoadTime) {
    console.log(
      `  平均加载时间: ${summary.summary.averageLoadTime.toFixed(0)}ms`
    );
  }

  if (summary.summary.fastestUrl) {
    console.log(chalk.green(`  最快: ${summary.summary.fastestUrl}`));
  }

  if (summary.summary.slowestUrl) {
    console.log(chalk.yellow(`  最慢: ${summary.summary.slowestUrl}`));
  }

  console.log();
}

main().catch((error) => {
  console.error(chalk.red('\n发生错误:'), error.message);
  process.exit(1);
});
