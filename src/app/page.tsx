import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { PostList } from "@/components/post-list";

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
          <PostList posts={posts} />
        )}
      </section>
    </div>
  );
}
