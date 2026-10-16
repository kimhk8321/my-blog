import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-privacy-"));
fs.mkdirSync(path.join(directory, "posts"));
fs.mkdirSync(path.join(directory, ".private", "interview"), { recursive: true });
const frontmatter = '---\ntitle: "Example"\ndescription: "Example"\ndate: "2026-10-15"\n---\n';
fs.writeFileSync(path.join(directory, "posts", "public-note.md"), frontmatter + "PUBLIC_SENTINEL");
fs.writeFileSync(path.join(directory, ".private", "interview", "hidden.md"), frontmatter + "PRIVATE_SENTINEL");

afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(directory, { recursive: true, force: true });
});

describe("public post boundary", () => {
  it("never enumerates private manuscripts or accepts traversal through the public reader", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(directory);
    vi.resetModules();
    const posts = await import("@/lib/posts");
    expect(posts.getAllPostSlugs()).toEqual(["public-note"]);
    expect(JSON.stringify(posts.getAllPostsWithContent())).not.toContain("PRIVATE_SENTINEL");
    for (const slug of ["../.private/interview/hidden", "..\\.private\\interview\\hidden", "%2e%2e%2fhidden", "hidden"]) {
      expect(posts.getPostBySlug(slug)).toBeNull();
    }
    expect(posts.getPostBySlug("public-note")?.content).toContain("PUBLIC_SENTINEL");
  });
});
