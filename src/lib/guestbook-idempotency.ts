import { createHash } from "node:crypto";
import type { Redis } from "@upstash/redis";

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  at: number;
};

type StoreResult =
  | { status: "created" | "replayed"; entry: GuestbookEntry }
  | { status: "conflict" }
  | { status: "rate_limited" };

const MAX_ENTRIES = 100;
const RATE_SECONDS = 30;
const IDEMPOTENCY_SECONDS = 24 * 60 * 60;

const CREATE_ENTRY_SCRIPT = `
local previous = redis.call('GET', KEYS[1])
if previous then
  local record = cjson.decode(previous)
  if record.hash ~= ARGV[1] then
    return cjson.encode({ status = 'conflict' })
  end
  return cjson.encode({ status = 'replayed', entry = record.entry })
end

if redis.call('EXISTS', KEYS[2]) == 1 then
  return cjson.encode({ status = 'rate_limited' })
end

local entry = cjson.decode(ARGV[2])
redis.call('LPUSH', KEYS[3], ARGV[2])
redis.call('LTRIM', KEYS[3], 0, tonumber(ARGV[3]) - 1)
redis.call('SET', KEYS[1], cjson.encode({ hash = ARGV[1], entry = entry }), 'EX', tonumber(ARGV[4]))
redis.call('SET', KEYS[2], '1', 'EX', tonumber(ARGV[5]))

return cjson.encode({ status = 'created', entry = entry })
`;

export function isValidIdempotencyKey(value: string | null): value is string {
  return value !== null && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value);
}

export function guestbookRequestHash(name: string, message: string): string {
  return createHash("sha256").update(JSON.stringify([name, message])).digest("hex");
}

export async function createGuestbookEntry(
  client: Redis,
  input: { key: string; ip: string; name: string; message: string },
  entry: GuestbookEntry,
  keys: [string, string, string] = [
    `guestbook:idempotency:${input.key}`,
    `rl:guestbook:${input.ip}`,
    "guestbook",
  ],
): Promise<StoreResult> {
  const result = await client.eval<string[], StoreResult>(
    CREATE_ENTRY_SCRIPT,
    keys,
    [
      guestbookRequestHash(input.name, input.message),
      JSON.stringify(entry),
      String(MAX_ENTRIES),
      String(IDEMPOTENCY_SECONDS),
      String(RATE_SECONDS),
    ],
  );

  if (
    result.status === "created" ||
    result.status === "replayed" ||
    result.status === "conflict" ||
    result.status === "rate_limited"
  ) {
    return result;
  }

  throw new Error("Unexpected guestbook store result");
}
