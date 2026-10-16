import Link from "next/link";
import { getInterviewNotes } from "@/lib/interview-notes";
import { formatDate } from "@/lib/format";

export default async function InterviewPage() {
  const notes = await getInterviewNotes();
  return (
    <section>
      <Link href="/admin" className="text-sm text-foreground/60 hover:text-foreground">← 관리 화면</Link>
      <header className="mb-8 mt-6">
        <p className="mb-2 text-sm text-foreground/50">관리자 전용 · {notes.length}편</p>
        <h1 className="text-3xl font-bold tracking-tight">면접 준비</h1>
        <p className="mt-3 text-foreground/70">면접 질문별 답변과 코드 예제, 꼬리질문을 주제별로 정리했습니다.</p>
      </header>
      {notes.length === 0 ? (
        <p className="rounded-lg border border-black/10 p-5 text-foreground/60 dark:border-white/15">아직 등록된 글이 없습니다.</p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link href={`/admin/interview/${note.slug}`} prefetch={false} className="block h-full rounded-lg border border-black/10 p-5 transition-colors hover:bg-foreground/[0.03] dark:border-white/15">
                <p className="text-xs text-foreground/50">{note.order}. {note.topic} · {formatDate(note.date)}</p>
                {note.privateOnly && <span className="mt-2 inline-block rounded bg-foreground/[0.06] px-2 py-1 text-xs text-foreground/65">공개 제외</span>}
                <h2 className="mt-2 text-lg font-semibold">{note.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">{note.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
