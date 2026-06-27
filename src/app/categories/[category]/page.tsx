import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categories,
  getCategoryById,
  isValidCategory,
} from "@/lib/categories";
import { getPostsByCategory } from "@/lib/posts";
import { PostList } from "@/components/post-list";

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map(({ id }) => ({ category: id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const found = getCategoryById(category);
  if (!found) return {};

  return {
    title: found.label,
    description: found.description,
    alternates: { canonical: `/categories/${category}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const found = getCategoryById(category)!;
  const posts = getPostsByCategory(category);

  return (
    <div>
      <Link
        href="/categories"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        ← 모든 카테고리
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{found.label}</h1>
      <p className="mt-2 text-foreground/60">{found.description}</p>

      <div className="mt-10">
        {posts.length === 0 ? (
          <p className="text-foreground/60">
            아직 이 카테고리에 작성된 글이 없습니다.
          </p>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </div>
  );
}
