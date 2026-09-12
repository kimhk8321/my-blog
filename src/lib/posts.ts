import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categories, type Category } from "@/lib/categories";
import { sortPosts } from "@/lib/post-sort";
import { collectTags, tagKey } from "@/lib/tags";

const POSTS_DIR = path.join(process.cwd(), "posts");

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  category?: string;
  tags?: string[];
  draft?: boolean;
  migrated?: boolean;
  /** 같은 날짜 글의 순서(먼저 쓴 순으로 1,2,3…). 최신순에서 큰 값(최신 글)이 위로. */
  order?: number;
  /** 연재물이면 시리즈 이름. 같은 이름끼리 한 시리즈로 묶인다. */
  series?: string;
  /** 시리즈 안에서 몇 번째 글인지(1부터). */
  seriesOrder?: number;
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
    order: fm.order,
    series: fm.series,
    seriesOrder: fm.seriesOrder,
    content,
  };
}

function readAllPosts(): Post[] {
  const showDrafts = process.env.NODE_ENV !== "production";

  const posts = getPostFileNames()
    .map((name) => getPostBySlug(fileToSlug(name)))
    .filter((p): p is Post => p !== null)
    .filter((p) => showDrafts || !p.draft);

  return sortPosts(posts, "latest");
}

let cachedPosts: Post[] | null = null;
let cachedMeta: PostMeta[] | null = null;

/** 본문까지 포함한 전체 글. 검색 색인처럼 content가 필요한 곳에서 사용. */
export function getAllPostsWithContent(): Post[] {
  if (process.env.NODE_ENV !== "production") return readAllPosts();
  return (cachedPosts ??= readAllPosts());
}

/** 본문을 떼고 메타데이터만 남긴다. */
function toMeta(post: Post): PostMeta {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    tags: post.tags,
    draft: post.draft,
    migrated: post.migrated,
    order: post.order,
    series: post.series,
    seriesOrder: post.seriesOrder,
  };
}

export function getAllPosts(): PostMeta[] {
  if (process.env.NODE_ENV !== "production") {
    return getAllPostsWithContent().map(toMeta);
  }
  return (cachedMeta ??= getAllPostsWithContent().map(toMeta));
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  return collectTags(getAllPosts().map((post) => post.tags));
}

export function getPostsByTag(tag: string): PostMeta[] {
  const key = tagKey(tag);
  return getAllPosts().filter((post) =>
    (post.tags ?? []).some((t) => tagKey(t) === key),
  );
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
