import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ isAdmin: vi.fn(), hget: vi.fn(), hgetall: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.isAdmin }));
vi.mock("@/lib/redis", () => ({ redis: { hget: mocks.hget, hgetall: mocks.hgetall } }));
vi.mock("next/navigation", () => ({ redirect: (location: string) => { throw new Error(`redirect:${location}`); } }));

import { getInterviewNote, getInterviewNotes } from "@/lib/interview-notes";
import { parseInterviewMarkdown, parseStoredInterviewNote } from "@/lib/interview-note-format.mjs";
import { GET } from "@/app/api/admin/session/route";

const note = {
  slug: "sample-note", title: "가상 학습 글", description: "테스트 전용 설명", date: "2026-10-15",
  topic: "테스트", order: 1, privateOnly: false, content: "PRIVATE_TEST_SENTINEL",
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.isAdmin.mockResolvedValue(false);
});

describe("private interview access", () => {
  it("blocks list and detail before accessing storage for an unauthenticated or expired session", async () => {
    await expect(getInterviewNotes()).rejects.toThrow("redirect:/admin");
    await expect(getInterviewNote(note.slug)).rejects.toThrow("redirect:/admin");
    expect(mocks.hgetall).not.toHaveBeenCalled();
    expect(mocks.hget).not.toHaveBeenCalled();
  });

  it("checks authorization again after a previously authorized read", async () => {
    mocks.isAdmin.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mocks.hget.mockResolvedValue(note);
    expect(await getInterviewNote(note.slug)).toEqual(note);
    await expect(getInterviewNote(note.slug)).rejects.toThrow("redirect:/admin");
    expect(mocks.hget).toHaveBeenCalledTimes(1);
  });

  it("returns ordered metadata without bodies or unexpected fields", async () => {
    mocks.isAdmin.mockResolvedValue(true);
    mocks.hgetall.mockResolvedValue({
      later: { ...note, slug: "later", order: 2, extraSecret: "HIDDEN" },
      [note.slug]: note,
    });
    const result = await getInterviewNotes();
    expect(result.map((item) => item.order)).toEqual([1, 2]);
    expect(JSON.stringify(result)).not.toContain(note.content);
    expect(JSON.stringify(result)).not.toContain("HIDDEN");
  });

  it("rejects malformed slugs without storage access and handles a missing document", async () => {
    mocks.isAdmin.mockResolvedValue(true);
    for (const slug of ["../secret", "a/b", "a\\b", "a".repeat(101), ""]) {
      expect(await getInterviewNote(slug)).toBeNull();
    }
    expect(mocks.hget).not.toHaveBeenCalled();
    mocks.hget.mockResolvedValue(null);
    expect(await getInterviewNote("missing")).toBeNull();
  });

  it("keeps publication-excluded notes last and preserves the flag in detail", async () => {
    mocks.isAdmin.mockResolvedValue(true);
    const privateNote = { ...note, slug: "personal", privateOnly: true };
    mocks.hgetall.mockResolvedValue({ personal: privateNote, general: { ...note, slug: "general", order: 2 } });
    const result = await getInterviewNotes();
    expect(result.map((item) => item.slug)).toEqual(["general", "personal"]);
    expect(result.at(-1)?.privateOnly).toBe(true);
    mocks.hget.mockResolvedValue(privateNote);
    expect((await getInterviewNote("personal"))?.privateOnly).toBe(true);
  });

  it("does not fall back to cached content when storage is unavailable", async () => {
    mocks.isAdmin.mockResolvedValue(true);
    mocks.hgetall.mockRejectedValue(new Error("offline"));
    await expect(getInterviewNotes()).rejects.toThrow("offline");
  });

  it("session discovery exposes only a boolean and cannot be publicly cached", async () => {
    for (const authenticated of [false, true]) {
      mocks.isAdmin.mockResolvedValue(authenticated);
      const response = await GET();
      expect(await response.json()).toEqual({ authenticated });
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect(response.headers.get("cache-control")).toContain("private");
    }
  });
});

describe("interview manuscript validation", () => {
  it("accepts a manuscript and strips arbitrary metadata", () => {
    const source = '---\ntitle: "가상 학습 글"\ndescription: "설명"\ndate: "2026-10-15"\ntopic: "테스트"\norder: 1\nextra: "secret"\n---\n본문';
    const result = parseInterviewMarkdown(source, "sample");
    expect(result.slug).toBe("sample");
    expect(result.content.trim()).toBe("본문");
    expect(result).not.toHaveProperty("extra");
  });

  it("rejects invalid dates, metadata and mismatched identities", () => {
    for (const fields of [{ date: "2026-02-30" }, { order: -1 }, { title: "" }, { slug: "other" }, { content: 42 }, { privateOnly: "true" }]) {
      expect(() => parseStoredInterviewNote({ ...note, ...fields }, note.slug)).toThrow();
    }
  });

  it("retains an explicit publication exclusion and accepts older manuscripts", () => {
    expect(parseStoredInterviewNote({ ...note, privateOnly: true }, note.slug).privateOnly).toBe(true);
    expect(parseStoredInterviewNote({ ...note, privateOnly: undefined }, note.slug).privateOnly).toBe(false);
  });
});
