import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { getInterviewNote, getInterviewNotes } from "@/lib/interview-notes";
import { formatDate } from "@/lib/format";
import { extractToc } from "@/lib/toc";
import { PostToc } from "@/components/post-toc";
import { PostNav } from "@/components/post-nav";

export default async function InterviewNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [note, notes] = await Promise.all([getInterviewNote(slug), getInterviewNotes()]);
  if (!note) notFound();
  // 목록과 같은 순서(공개 제외 글은 마지막)로 앞뒤 글을 잇는다
  const index = notes.findIndex((item) => item.slug === note.slug);
  const older = index > 0 ? notes[index - 1] : null;
  const newer = index >= 0 ? notes[index + 1] ?? null : null;

  return (
    <article>
      <Link href="/admin/interview" prefetch={false} className="text-sm text-foreground/60 hover:text-foreground">← 면접 준비 목록</Link>
      <header className="mb-8 mt-6">
        <p className="text-sm text-foreground/50">관리자 전용 · {note.topic} · {formatDate(note.date)}</p>
        {note.privateOnly && <p className="mt-2 text-sm text-foreground/60">공개 제외</p>}
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">{note.title}</h1>
        <p className="mt-3 text-foreground/70">{note.description}</p>
      </header>
      <PostToc items={extractToc(note.content)} />
      <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:text-[#e6edf3]">
        <MDXRemote source={note.content} options={{ mdxOptions: { remarkPlugins: [[remarkGfm, { singleTilde: false }]], rehypePlugins: [rehypeSlug, rehypeHighlight] } }} />
      </div>
      <PostNav older={older} newer={newer} basePath="/admin/interview" prefetch={false} />
      <Link href="/admin/interview" prefetch={false} className="mt-10 inline-block text-sm text-foreground/60 hover:text-foreground">면접 준비 목록으로</Link>
    </article>
  );
}
