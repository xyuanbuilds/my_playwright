/**
 * Domain.json WebSocket 测试
 *
 * 读取 domain.json 中的页面配置，并测试每个页面的 WebSocket 连接
 */

export interface DomainConfig {
  name: string;
  description: string;
  /** 智能体默认链接 */
  url: string;
  /** 带默认 query 的链接，访问后会自动发送一条消息 */
  queryUrl?: string;
}

export interface DomainsFile {
  domains: DomainConfig[];
}
