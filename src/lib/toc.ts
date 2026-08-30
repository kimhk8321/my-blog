import GithubSlugger from "github-slugger";

export interface TocItem {
  /** 헤딩에 붙는 id — rehype-slug가 만드는 것과 같아야 앵커가 동작한다. */
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 본문에서 목차를 뽑는다.
 *
 * id는 rehype-slug가 렌더링할 때 붙이는 것과 **정확히 같아야** 한다.
 * 그래서 같은 라이브러리(github-slugger)를, 같은 순서로 돌린다.
 * 중복 제목에 -1, -2를 붙이는 규칙까지 맞추려면 순서가 중요하다.
 */
export function extractToc(mdx: string): TocItem[] {
  // 코드 블록 안의 주석(# ...)이 헤딩으로 잡히지 않게 먼저 걷어낸다.
  const withoutCode = mdx.replace(/```[\s\S]*?```/g, "");

  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    // rehype-slug는 "그려진 글자"로 id를 만든다. 마크다운 기호를 지워 맞춘다.
    const text = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[`*_~]/g, "")
      .trim();

    // 목차에 안 쓸 단계도 슬러그는 만들어야 중복 번호가 어긋나지 않는다.
    const id = slugger.slug(text);
    if (level === 2 || level === 3) {
      items.push({ id, text, level });
    }
  }

  return items;
}
