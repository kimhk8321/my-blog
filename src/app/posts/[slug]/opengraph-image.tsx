import { ImageResponse } from "next/og";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "글 대표 이미지";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? siteConfig.title;
  const description = post?.description ?? siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1f2937 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#9ca3af", display: "flex" }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#d1d5db",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
