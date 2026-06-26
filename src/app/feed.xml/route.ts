import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { siteConfig, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteUrl,
    link: siteUrl,
    language: "ko",
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
    feedLinks: {
      rss: `${siteUrl}/feed.xml`,
    },
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteUrl,
    },
  });

  for (const post of getAllPosts()) {
    const url = `${siteUrl}/posts/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(post.date),
      author: [{ name: siteConfig.author.name }],
      category: post.tags?.map((name) => ({ name })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
