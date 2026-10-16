import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { INTERVIEW_NOTES_KEY, parseInterviewMarkdown } from "../src/lib/interview-note-format.mjs";

const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => !["--write", "--replace"].includes(arg)) || (args.has("--replace") && !args.has("--write"))) {
  throw new Error("사용법: pnpm interview:import [--write] [--replace]");
}

const directory = path.join(process.cwd(), ".private", "interview");
const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".md"));
const notes = await Promise.all(files.map(async (file) => parseInterviewMarkdown(await fs.readFile(path.join(directory, file), "utf8"), file.slice(0, -3))));
if (!notes.length) throw new Error(".private/interview에 원고가 없습니다.");
if (new Set(notes.map((note) => note.order)).size !== notes.length) throw new Error("글 순서가 중복됩니다.");
await Promise.all(notes.map((note) => serialize(note.content, {
  mdxOptions: { remarkPlugins: [[remarkGfm, { singleTilde: false }]] },
})));
console.log(`원고 ${notes.length}편 검증 완료`);

if (args.has("--write")) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis 환경변수가 필요합니다.");
  const redis = new Redis({ url, token });
  let written = 0;
  for (const note of notes) {
    if (args.has("--replace")) {
      await redis.hset(INTERVIEW_NOTES_KEY, { [note.slug]: note });
      written++;
    } else {
      written += await redis.hsetnx(INTERVIEW_NOTES_KEY, note.slug, note);
    }
  }
  console.log(`${written}편 저장 완료 · ${notes.length - written}편은 기존 글 유지`);
} else {
  console.log("검증만 실행했습니다. 저장하려면 --write를 추가하세요.");
}
