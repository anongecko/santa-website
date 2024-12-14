import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

interface AgentConfig {
  protocol?: string;
  host: string;
  port: number;
  auth?: string;
}

export function createHttpAgent(config: AgentConfig): HttpAgent | HttpsAgent {
  const AgentClass = config.protocol === 'https' ? HttpsAgent : HttpAgent;
  return new AgentClass({
    keepAlive: true,
    timeout: 10000,
    maxSockets: 10,
    proxy: {
      host: config.host,
      port: config.port,
      auth: config.auth,
    },
  });
}
