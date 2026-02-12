import * as fs from "fs";
import * as path from "path";
import type { DomainsFile } from "./type";

// 默认读取当前目录 domain.json，如需切换文件可用 TBOX_DOMAIN_FILE 指定路径
const DEFAULT_DOMAIN_FILE = path.join(__dirname, "domain.json");
const ENV_DOMAIN_FILE = process.env.TBOX_DOMAIN_FILE;
// 可用 TBOX_BASE_ORIGIN/TBOX_BASE_URL 覆盖域名（保留 path/query）
const ENV_BASE_ORIGIN =
  process.env.TBOX_BASE_ORIGIN || process.env.TBOX_BASE_URL;

function resolveConfigPath(): string {
  if (!ENV_DOMAIN_FILE) return DEFAULT_DOMAIN_FILE;
  return path.isAbsolute(ENV_DOMAIN_FILE)
    ? ENV_DOMAIN_FILE
    : path.join(process.cwd(), ENV_DOMAIN_FILE);
}

function overrideOrigin(url: string, baseOrigin?: string): string {
  if (!baseOrigin) return url;
  try {
    const base = new URL(baseOrigin);
    const target = new URL(url);

    // 仅替换协议/host，可选覆盖路径前缀；agent.html 及其后缀保持原样
    const suffixIndex = target.pathname.lastIndexOf("/agent.html");
    const suffix =
      suffixIndex >= 0 ? target.pathname.slice(suffixIndex) : target.pathname;
    const basePath =
      base.pathname === "/" ? "" : base.pathname.replace(/\/+$/, "");

    target.protocol = base.protocol;
    target.host = base.host;
    target.pathname = `${basePath}${suffix}`;
    return target.toString();
  } catch {
    return url;
  }
}

export function loadDomains(): DomainsFile {
  const configPath = resolveConfigPath();
  const raw = fs.readFileSync(configPath, "utf-8");
  const data: DomainsFile = JSON.parse(raw);

  if (!ENV_BASE_ORIGIN) return data;
  const normalized = ENV_BASE_ORIGIN.replace(/\/+$/, "");

  // 仅替换域名部分，路径/参数保持不变
  return {
    domains: data.domains.map((domain) => ({
      ...domain,
      url: overrideOrigin(domain.url, normalized),
      queryUrl: domain.queryUrl
        ? overrideOrigin(domain.queryUrl, normalized)
        : domain.queryUrl,
    })),
  };
}
