import { describe, it, expect } from 'vitest';
import { app } from './index.js';

describe('Indexer Hono Routes Stubs', () => {
  it('should return a 501 Not Implemented response for GET /streams', async () => {
    const res = await app.request('/streams');
    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data).toEqual({ error: 'not implemented' });
  });

  it('should return a 501 Not Implemented response for GET /escrows', async () => {
    const res = await app.request('/escrows');
    expect(res.status).toBe(501);
    const data = await res.json();
    expect(data).toEqual({ error: 'not implemented' });
  });
});
