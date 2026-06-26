import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostList } from "@/components/post-list";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `'${decoded}' 태그가 달린 글 목록입니다.`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);
  if (posts.length === 0) notFound();

  return (
    <div>
      <Link
        href="/tags"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        ← 모든 태그
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">#{decoded}</h1>
      <p className="mt-2 text-foreground/60">{posts.length}개의 글</p>

      <div className="mt-10">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
