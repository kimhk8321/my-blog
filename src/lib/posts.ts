import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categories, type Category } from "@/lib/categories";
import { sortPosts } from "@/lib/post-sort";

const POSTS_DIR = path.join(process.cwd(), "posts");

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  category?: string;
  tags?: string[];
  draft?: boolean;
  migrated?: boolean;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
}

function fileToSlug(fileName: string): string {
  return fileName.replace(/\.mdx?$/, "");
}

function getPostFileNames(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((name) => /\.mdx?$/.test(name));
}

export function getPostBySlug(slug: string): Post | null {
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath)
    ? mdxPath
    : fs.existsSync(mdPath)
      ? mdPath
      : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as PostFrontmatter;

  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    category: fm.category,
    tags: fm.tags ?? [],
    draft: fm.draft ?? false,
    migrated: fm.migrated ?? false,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  const showDrafts = process.env.NODE_ENV !== "production";

  const posts = getPostFileNames()
    .map((name) => getPostBySlug(fileToSlug(name)))
    .filter((p): p is Post => p !== null)
    .filter((p) => showDrafts || !p.draft);

  return sortPosts(posts, "latest");
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "ko"));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => (post.tags ?? []).includes(tag));
}

export function getAdjacentPosts(slug: string): {
  newer: PostMeta | null;
  older: PostMeta | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function getPostsByCategory(categoryId: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === categoryId);
}

export function getCategoryCounts(): { category: Category; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    if (post.category) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
  }
  return categories.map((category) => ({
    category,
    count: counts.get(category.id) ?? 0,
  }));
}
