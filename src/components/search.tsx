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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(initial));
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  // 영문·숫자는 두 글자부터 색인해 두었다. 한 글자로는 찾을 수 없다.
  const tooShort = /^[a-z0-9]$/i.test(trimmed);

  // 화면 상태는 따로 들고 있지 않고 지금 가진 값에서 계산한다.
  // 효과에서 상태를 맞춰 넣으면 렌더가 한 번 더 돌고, 어긋날 여지도 생긴다.
  const status: "idle" | "hint" | "loading" | "error" | "done" =
    trimmed.length === 0
      ? "idle"
      : tooShort
        ? "hint"
        : loading
          ? "loading"
          : error
            ? "error"
            : "done";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 효과는 "바깥 세계와 맞추는 일"만 한다 — 요청을 보내고 결과를 담는 것.
  useEffect(() => {
    if (trimmed.length === 0 || tooShort) return;

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
          setResults([]);
          setLoading(false);
          return;
        }
        setError("");
        setResults(data.results ?? []);
        setLoading(false);
      } catch (e) {
        // 이전 요청이 취소된 것이면 무시(응답 순서가 뒤바뀌는 것을 방지)
        if ((e as Error).name === "AbortError") return;
        setError("네트워크 오류");
        setResults([]);
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, tooShort]);

  // 주소창에도 검색어를 남겨 링크를 공유할 수 있게 한다.
  useEffect(() => {
    const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    const timer = setTimeout(() => {
      router.replace(next, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [trimmed, router]);

  const terms = query.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const next = e.target.value.trim();
            setQuery(e.target.value);
            // 상태 변경의 출발점에서 함께 정한다(효과에서 맞춰 넣지 않는다).
            // 실제로 요청을 보낼 조건과 똑같아야 한다 — 한글은 한 글자도 검색된다.
            setLoading(next.length > 0 && !/^[a-z0-9]$/i.test(next));
          }}
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
          &lsquo;{trimmed}&rsquo;에 대한 결과가 없습니다. 다른 검색어를
          입력해 보세요.
        </p>
      )}

      {/* 검색어가 없거나 너무 짧으면 이전 결과가 남지 않게 감춘다.
          검색 중일 때는 이전 결과를 그대로 둬서 화면이 깜빡이지 않게 한다. */}
      <ul className="flex flex-col gap-5">
        {status !== "idle" && status !== "hint" && results.map((hit) => {
          const category = hit.category
            ? getCategoryById(hit.category)
            : undefined;
          return (
            <li key={hit.slug}>
              <Link href={`/posts/${hit.slug}`} className="group block">
                <h2 className="font-semibold break-words group-hover:text-indigo-500 transition-colors">
                  <Highlight text={hit.title} terms={terms} />
                </h2>
                <p className="mt-1 break-words text-sm leading-relaxed text-foreground/70">
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
