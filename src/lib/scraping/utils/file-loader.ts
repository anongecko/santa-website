// src/lib/scraping/utils/file-loader.ts

import { readFile } from 'fs/promises';
import { join } from 'path';
import { Proxy, UserAgent } from '../types';

export class FileLoader {
  private static configDir = join(process.cwd(), 'config');

  static async loadProxies(): Promise<Proxy[]> {
    try {
      const content = await readFile(join(this.configDir, 'proxies.txt'), 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [host, port, protocol = 'http', username, password] = line.trim().split(':');
          return {
            host,
            port: parseInt(port, 10),
            protocol: protocol as 'http' | 'https',
            username,
            password,
            lastUsed: 0,
            failCount: 0,
            responseTime: 0,
          };
        });
    } catch (error) {
      console.error('Error loading proxies:', error);
      return [];
    }
  }

  static async loadUserAgents(): Promise<UserAgent[]> {
    try {
      const content = await readFile(join(this.configDir, 'user-agents.txt'), 'utf-8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({
          string: line.trim(),
          lastUsed: 0,
        }));
    } catch (error) {
      console.error('Error loading user agents:', error);
      return [];
    }
  }

  static async reloadConfig(): Promise<{
    proxies: Proxy[];
    userAgents: UserAgent[];
  }> {
    const [proxies, userAgents] = await Promise.all([this.loadProxies(), this.loadUserAgents()]);
    return { proxies, userAgents };
  }
}
