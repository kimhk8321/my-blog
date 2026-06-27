import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryCounts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "카테고리",
  description: "주제별로 글을 모아 봅니다.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  const items = getCategoryCounts();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">카테고리</h1>
      <p className="mt-2 text-foreground/60">주제별로 정리한 학습 기록입니다.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map(({ category, count }) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.id}`}
              className="group block h-full rounded-lg border border-black/10 p-5 transition-colors hover:border-foreground/30 dark:border-white/15"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold tracking-tight group-hover:underline underline-offset-4">
                  {category.label}
                </h2>
                <span className="shrink-0 text-sm text-foreground/40">
                  {count}개
                </span>
              </div>
              <p className="mt-1.5 text-sm text-foreground/60">
                {category.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
