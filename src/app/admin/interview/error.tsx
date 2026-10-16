"use client";

// unstable_retry는 서버 데이터를 다시 가져온다. reset은 다시 그리기만 해서 저장소 오류가 복구되지 않는다.
export default function InterviewError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <div role="alert" className="space-y-4">
      <h2 className="text-xl font-semibold">글을 불러오지 못했습니다.</h2>
      <p className="text-sm text-foreground/60">잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={() => unstable_retry()} className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20">다시 시도</button>
    </div>
  );
}
