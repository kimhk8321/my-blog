"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategoryById } from "@/lib/categories";

interface SearchHit {
  slug: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  tags: string[];
  snippet: string;
}

/** 검색어와 겹치는 부분을 강조. 정규식 특수문자는 이스케이프해서 넣는다. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  const lowered = terms.map((t) => t.toLowerCase());

  return (
    <>
      {parts.map((part, i) =>
        lowered.includes(part.toLowerCase()) ? (
          // React가 텍스트를 이스케이프하므로 innerHTML 없이 안전하게 강조
          <mark
            key={i}
            className="rounded bg-indigo-200/60 px-0.5 text-inherit dark:bg-indigo-400/30"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error" | "hint"
  >(initial ? "loading" : "idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setResults([]);
      setStatus("idle");
      setError("");
      return;
    }

    // 영문·숫자는 두 글자부터 색인해 두었다. 한 글자로는 찾을 수 없으니
    // "결과 없음" 대신 무엇을 하면 되는지 알려준다.
    if (/^[a-z0-9]$/i.test(trimmed)) {
      setResults([]);
      setStatus("hint");
      setError("");
      return;
    }

    setStatus("loading");
    // 타이핑마다 요청하지 않도록 잠깐 기다렸다가 보낸다(디바운스).
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "검색에 실패했습니다");
          setStatus("error");
          return;
        }
        setResults(data.results ?? []);
        setStatus("done");
      } catch (e) {
        // 이전 요청이 취소된 것이면 무시(응답 순서가 뒤바뀌는 것을 방지)
        if ((e as Error).name === "AbortError") return;
        setError("네트워크 오류");
        setStatus("error");
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // 주소창에도 검색어를 남겨 링크를 공유할 수 있게 한다.
  useEffect(() => {
    const trimmed = query.trim();
    const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    const timer = setTimeout(() => {
      router.replace(next, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [query, router]);

  const terms = query.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (제목·태그·본문)"
          maxLength={50}
          className="w-full rounded-lg border border-black/15 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
        />
        <div className="flex h-4 items-center justify-between text-xs">
          <span className="text-red-500">{error}</span>
          <span className="text-foreground/40">
            {status === "loading" && "검색 중…"}
            {status === "done" && `${results.length}개 결과`}
          </span>
        </div>
      </div>

      {status === "hint" && (
        <p className="text-sm text-foreground/60">
          영문·숫자는 두 글자 이상 입력해 주세요. (한글은 한 글자부터 검색됩니다)
        </p>
      )}

      {status === "done" && results.length === 0 && (
        <p className="text-sm text-foreground/60">
          &lsquo;{query.trim()}&rsquo;에 대한 결과가 없습니다. 다른 검색어를
          입력해 보세요.
        </p>
      )}

      <ul className="flex flex-col gap-5">
        {results.map((hit) => {
          const category = hit.category
            ? getCategoryById(hit.category)
            : undefined;
          return (
            <li key={hit.slug}>
              <Link href={`/posts/${hit.slug}`} className="group block">
                <h2 className="font-semibold group-hover:text-indigo-500 transition-colors">
                  <Highlight text={hit.title} terms={terms} />
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                  <Highlight text={hit.snippet} terms={terms} />
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-foreground/40">
                  <time dateTime={hit.date}>{hit.date}</time>
                  {category && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{category.label}</span>
                    </>
                  )}
                  {hit.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
