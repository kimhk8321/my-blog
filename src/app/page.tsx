import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="mt-3 text-foreground/70">{siteConfig.description}</p>
      </section>

      <section>
        <h2 className="sr-only">글 목록</h2>
        {posts.length === 0 ? (
          <p className="text-foreground/60">아직 작성된 글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <Link href={`/posts/${post.slug}`} className="group block">
                    <time
                      dateTime={post.date}
                      className="text-sm text-foreground/50"
                    >
                      {formatDate(post.date)}
                    </time>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight group-hover:underline underline-offset-4">
                      {post.title}
                      {post.draft && (
                        <span className="ml-2 align-middle rounded bg-yellow-500/15 px-2 py-0.5 text-xs font-normal text-yellow-600 dark:text-yellow-400">
                          초안
                        </span>
                      )}
                    </h3>
                    <p className="mt-2 text-foreground/70">{post.description}</p>
                  </Link>
                  {post.tags && post.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-black/10 px-3 py-0.5 text-xs text-foreground/60 dark:border-white/15"
                        >
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
