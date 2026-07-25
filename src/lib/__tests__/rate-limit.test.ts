import { rateLimit } from "../rate-limit";

describe("Rate Limiter", () => {
  it("should allow requests under the limit", async () => {
    const ip = "192.168.1.1";
    const res1 = await rateLimit(ip, 2, 60000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = await rateLimit(ip, 2, 60000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("should block requests over the limit", async () => {
    const ip = "192.168.1.2";
    await rateLimit(ip, 1, 60000); // 1st allowed
    const res2 = await rateLimit(ip, 1, 60000); // 2nd blocked
    expect(res2.success).toBe(false);
    expect(res2.remaining).toBe(0);
  });
});
