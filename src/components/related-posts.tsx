import Link from "next/link";
import { getRelatedPosts } from "@/lib/related";
import { getCategoryById } from "@/lib/categories";

export function RelatedPosts({ slug }: { slug: string }) {
  const related = getRelatedPosts(slug, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-black/10 pt-8 dark:border-white/10">
      <h2 className="text-sm font-semibold tracking-tight text-foreground/60">
        함께 읽을 만한 글
      </h2>

      <ul className="mt-4 flex flex-col gap-3">
        {related.map((post) => {
          const category = post.category
            ? getCategoryById(post.category)
            : undefined;

          return (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="group block rounded-lg border border-black/10 p-4 transition-colors hover:border-foreground/30 dark:border-white/15"
              >
                <h3 className="break-words font-medium group-hover:underline underline-offset-4">
                  {post.title}
                </h3>
                <p className="mt-1 line-clamp-2 break-words text-sm text-foreground/60">
                  {post.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground/40">
                  <time dateTime={post.date}>{post.date}</time>
                  {category && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{category.label}</span>
                    </>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
