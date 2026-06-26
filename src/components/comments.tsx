"use client";

import { useEffect, useRef } from "react";
import { giscusConfig, giscusEnabled } from "@/lib/giscus";

const GISCUS_ORIGIN = "https://giscus.app";

function currentTheme(): string {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!giscusEnabled || !ref.current) return;
    const container = ref.current;

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({
      "data-repo": giscusConfig.repo,
      "data-repo-id": giscusConfig.repoId,
      "data-category": giscusConfig.category,
      "data-category-id": giscusConfig.categoryId,
      "data-mapping": "pathname",
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "bottom",
      "data-lang": "ko",
      "data-loading": "lazy",
      "data-theme": currentTheme(),
    }).forEach(([key, value]) => script.setAttribute(key, value));
    container.appendChild(script);

    const observer = new MutationObserver(() => {
      const iframe =
        container.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: currentTheme() } } },
        GISCUS_ORIGIN,
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, []);

  if (!giscusEnabled) return null;

  return <section className="mt-16" ref={ref} />;
}
