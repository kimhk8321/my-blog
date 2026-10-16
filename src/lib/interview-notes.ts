import "server-only";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { redis } from "@/lib/redis";
import { INTERVIEW_NOTES_KEY, isInterviewSlug, parseStoredInterviewNote } from "@/lib/interview-note-format.mjs";

export type InterviewNote = ReturnType<typeof parseStoredInterviewNote>;
export type InterviewNoteMeta = Omit<InterviewNote, "content">;

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
  if (!redis) throw new Error("면접 노트 저장소에 연결할 수 없습니다.");
  return redis;
}

export async function getInterviewNotes(): Promise<InterviewNoteMeta[]> {
  const store = await requireAdmin();
  const entries = await store.hgetall<Record<string, unknown>>(INTERVIEW_NOTES_KEY);
  return Object.entries(entries ?? {}).map(([slug, value]) => {
    const note = parseStoredInterviewNote(value, slug);
    return {
      slug: note.slug, title: note.title, description: note.description,
      date: note.date, topic: note.topic, order: note.order, privateOnly: note.privateOnly,
    };
  }).sort((a, b) => Number(a.privateOnly) - Number(b.privateOnly) || a.order - b.order || a.slug.localeCompare(b.slug));
}

export async function getInterviewNote(slug: string): Promise<InterviewNote | null> {
  const store = await requireAdmin();
  if (!isInterviewSlug(slug)) return null;
  const value = await store.hget<unknown>(INTERVIEW_NOTES_KEY, slug);
  return value === null ? null : parseStoredInterviewNote(value, slug);
}
