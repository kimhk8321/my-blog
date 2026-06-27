// 서버/클라이언트 양쪽에서 쓰는 순수 포맷 유틸 (node:fs 등 서버 전용 의존성 없음)

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
