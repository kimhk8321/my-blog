import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createGuestbookEntry,
  guestbookRequestHash,
  isValidIdempotencyKey,
  type GuestbookEntry,
} from "@/lib/guestbook-idempotency";

describe("guestbook idempotency input", () => {
  it("accepts only v4 UUIDs", () => {
    expect(isValidIdempotencyKey(randomUUID())).toBe(true);
    expect(isValidIdempotencyKey(null)).toBe(false);
    expect(isValidIdempotencyKey("same-request")).toBe(false);
  });

  it("uses both normalized fields to identify a request", () => {
    expect(guestbookRequestHash("A", "BC")).not.toBe(guestbookRequestHash("AB", "C"));
    expect(guestbookRequestHash("A", "BC")).toBe(guestbookRequestHash("A", "BC"));
  });
});

describe.skipIf(process.env.GUESTBOOK_REDIS_INTEGRATION !== "1")(
  "guestbook idempotency with Redis",
  () => {
    it("stores concurrent retries once and keeps rate limiting new attempts", async () => {
      const { Redis } = await import("@upstash/redis");
      const client = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const suffix = randomUUID();
      const keys: [string, string, string] = [
        `test:guestbook:${suffix}:idem`,
        `test:guestbook:${suffix}:rate`,
        `test:guestbook:${suffix}:entries`,
      ];
      const nextIdemKey = `test:guestbook:${suffix}:next`;
      const input = { key: suffix, ip: suffix, name: "테스트", message: "중복 저장 확인" };

      try {
        const results = await Promise.all(
          Array.from({ length: 5 }, () => {
            const entry: GuestbookEntry = {
              id: randomUUID(),
              name: input.name,
              message: input.message,
              at: Date.now(),
            };
            return createGuestbookEntry(client, input, entry, keys);
          }),
        );

        expect(results.filter((result) => result.status === "created")).toHaveLength(1);
        expect(results.filter((result) => result.status === "replayed")).toHaveLength(4);
        const entries = await client.lrange<GuestbookEntry>(keys[2], 0, -1);
        expect(entries).toHaveLength(1);
        expect(results.every((result) => "entry" in result && result.entry.id === entries[0].id)).toBe(true);

        const conflict = await createGuestbookEntry(
          client,
          { ...input, message: "다른 내용" },
          { id: randomUUID(), name: input.name, message: "다른 내용", at: Date.now() },
          keys,
        );
        expect(conflict.status).toBe("conflict");

        const limited = await createGuestbookEntry(
          client,
          { ...input, key: randomUUID() },
          { id: randomUUID(), name: input.name, message: input.message, at: Date.now() },
          [nextIdemKey, keys[1], keys[2]],
        );
        expect(limited.status).toBe("rate_limited");
        expect(await client.lrange(keys[2], 0, -1)).toHaveLength(1);
      } finally {
        await client.del(...keys, nextIdemKey);
      }
    });
  },
);
