import matter from "gray-matter";

export const INTERVIEW_NOTES_KEY = "private:interview:notes:v1";
export const isInterviewSlug = (slug) => typeof slug === "string" && /^[a-z0-9][a-z0-9-]{0,99}$/.test(slug);

/** @typedef {{ slug: string, title: string, description: string, date: string, topic: string, order: number, privateOnly: boolean, content: string }} InterviewNote */

/** @returns {InterviewNote} */
export function parseStoredInterviewNote(value, slug) {
  if (!isInterviewSlug(slug) || !value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("면접 노트 형식이 올바르지 않습니다.");
  }
  for (const key of ["title", "description", "date", "topic", "content"]) {
    if (typeof value[key] !== "string" || !value[key].trim()) {
      throw new Error(`면접 노트의 ${key} 항목을 확인해 주세요.`);
    }
  }
  if (value.slug !== slug || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
      !Number.isSafeInteger(value.order) || value.order < 1 ||
      value.title.length > 200 || value.description.length > 500 ||
      value.topic.length > 50 || value.content.length > 100_000 ||
      (value.privateOnly !== undefined && typeof value.privateOnly !== "boolean")) {
    throw new Error("면접 노트 메타데이터가 올바르지 않습니다.");
  }
  const parsedDate = new Date(`${value.date}T00:00:00Z`);
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.date) {
    throw new Error("면접 노트 날짜가 올바르지 않습니다.");
  }
  return {
    slug, title: value.title, description: value.description, date: value.date,
    topic: value.topic, order: value.order, privateOnly: value.privateOnly ?? false, content: value.content,
  };
}

/** @returns {InterviewNote} */
export function parseInterviewMarkdown(source, slug) {
  const { data, content } = matter(source);
  return parseStoredInterviewNote({ ...data, slug, content }, slug);
}
