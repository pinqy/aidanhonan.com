import { sleep } from './helpers';

describe('Helpers', () => {
  it('sleep happy path', async () => {
    const start = Date.now();

    await sleep(500);

    const middle = Date.now();
    expect(middle-start).toBeLessThan(550);
    expect(middle-start).toBeGreaterThanOrEqual(500);

    await sleep(250);

    const end = Date.now();
    expect(end-middle).toBeLessThan(300);
    expect(end-middle).toBeGreaterThanOrEqual(250);
  });
});