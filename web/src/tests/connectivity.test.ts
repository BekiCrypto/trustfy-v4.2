import { describe, it, expect } from 'vitest';
import http from 'http';

const checkUrl = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode || 0);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
};

describe('System Connectivity', () => {
  it('Web UI should be reachable', async () => {
    const status = await checkUrl('http://localhost:5174');
    expect(status).toBe(200);
  });

  it('API Health should be reachable', async () => {
    const status = await checkUrl('http://localhost:4000/v1/health');
    expect(status).toBe(200);
  });

  it('Indexer Status should be reachable', async () => {
    const status = await checkUrl('http://localhost:4000/v1/indexer/status');
    expect(status).toBe(200);
  }, 10000);

  it('Escrows List should be reachable', async () => {
    const status = await checkUrl('http://localhost:4000/v1/escrows');
    expect(status).toBe(200);
  });
});
