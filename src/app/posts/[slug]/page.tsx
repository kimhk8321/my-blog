import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { getCategoryById } from "@/lib/categories";
import { TagList } from "@/components/tag-list";
import { Comments } from "@/components/comments";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `/posts/${slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = post.category ? getCategoryById(post.category) : undefined;

  return (
    <article>
      <Link
        href="/"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        ← 글 목록으로
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {category && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/categories/${category.id}`}
                className="hover:text-foreground transition-colors"
              >
                {category.label}
              </Link>
            </>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-3 text-foreground/70">{post.description}</p>
        <div className="mt-4">
          <TagList tags={post.tags ?? []} />
        </div>
      </header>

      {post.migrated && (
        <aside className="mb-10 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/80">
          📦 이 글은 예전에 공부하며 정리해 둔 노트를 옮겨 온 기록입니다. 작성
          당시 기준이라 일부 내용은 현재와 다를 수 있으며, 오래된 부분은{" "}
          <strong className="font-semibold">📝 업데이트</strong> 표시로
          보완했습니다.
        </aside>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:text-[#e6edf3]">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeHighlight],
            },
          }}
        />
      </div>

      <Comments />
    </article>
  );
}
