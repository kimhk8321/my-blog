export interface PageResult<T> {
  items: T[];
  /** 실제로 보여 준 페이지. 범위를 벗어난 요청은 양 끝으로 당겨진다. */
  page: number;
  totalPages: number;
  total: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): PageResult<T> {
  const size = Math.max(1, Math.floor(perPage));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));

  const safe = Number.isFinite(page) ? Math.floor(page) : 1;
  const current = Math.min(Math.max(safe, 1), totalPages);

  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    totalPages,
    total,
  };
}

/** 페이지 번호 버튼 사이에 넣는 생략 표시. */
export const ELLIPSIS = "…";

/** 처음·끝·현재 주변만 남기고 가운데는 생략한다. → 1 … 4 [5] 6 … 20 */
export function pageWindow(
  page: number,
  totalPages: number,
  span = 1,
): (number | typeof ELLIPSIS)[] {
  const shown = new Set<number>([1, totalPages]);
  for (let i = page - span; i <= page + span; i++) {
    if (i >= 1 && i <= totalPages) shown.add(i);
  }

  const out: (number | typeof ELLIPSIS)[] = [];
  let prev = 0;
  for (const n of [...shown].sort((a, b) => a - b)) {
    if (prev && n - prev === 2) out.push(prev + 1);
    else if (prev && n - prev > 2) out.push(ELLIPSIS);
    out.push(n);
    prev = n;
  }
  return out;
}
