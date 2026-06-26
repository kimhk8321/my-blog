import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";
import { TagList } from "@/components/tag-list";

export function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="flex flex-col gap-8">
      {posts.map((post) => (
        <li key={post.slug}>
          <article>
            <Link href={`/posts/${post.slug}`} className="group block">
              <time dateTime={post.date} className="text-sm text-foreground/50">
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
            <div className="mt-3">
              <TagList tags={post.tags ?? []} />
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
