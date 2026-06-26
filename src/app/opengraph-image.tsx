import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.title;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 24,
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1f2937 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: "flex" }}>
          {siteConfig.name}
        </div>
        <div style={{ fontSize: 32, color: "#d1d5db", display: "flex" }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
