"use client";

import { useState } from "react";

type Editor = { text: string; version: number; message: string };
const initialText = "동시 수정할 문서";

export function OptimisticConcurrencyDemo() {
  const [document, setDocument] = useState({ text: initialText, version: 1 });
  const [editors, setEditors] = useState<Editor[]>([
    { text: initialText, version: 1, message: "" },
    { text: initialText, version: 1, message: "" },
  ]);

  function change(index: number, text: string) {
    setEditors((current) =>
      current.map((editor, i) => (i === index ? { ...editor, text, message: "" } : editor)),
    );
  }

  function save(index: number) {
    const editor = editors[index];
    if (editor.version !== document.version) {
      setEditors((current) =>
        current.map((item, i) =>
          i === index
            ? { ...item, message: `409 충돌: 서버 v${document.version}, 편집기 v${item.version}` }
            : item,
        ),
      );
      return;
    }

    const next = { text: editor.text, version: document.version + 1 };
    setDocument(next);
    setEditors((current) =>
      current.map((item, i) =>
        i === index ? { ...item, version: next.version, message: `v${next.version} 저장 완료` } : item,
      ),
    );
  }

  function reload(index: number) {
    setEditors((current) =>
      current.map((item, i) =>
        i === index
          ? { text: document.text, version: document.version, message: "최신 버전을 불러왔습니다." }
          : item,
      ),
    );
  }

  function reset() {
    setDocument({ text: initialText, version: 1 });
    setEditors([
      { text: initialText, version: 1, message: "" },
      { text: initialText, version: 1, message: "" },
    ]);
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-md bg-foreground/[0.05] px-3 py-2">
        서버 문서 <b>v{document.version}</b>: {document.text}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {editors.map((editor, index) => (
          <section key={index} className="rounded-md border border-black/10 p-3 dark:border-white/15">
            <div className="mb-2 font-medium">편집기 {index === 0 ? "A" : "B"} · v{editor.version}</div>
            <input value={editor.text} onChange={(event) => change(index, event.target.value)} className="w-full rounded-md border border-black/15 bg-transparent px-2.5 py-1.5 outline-none focus:border-blue-500 dark:border-white/20" />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => save(index)} className="rounded-md bg-foreground px-2.5 py-1 text-background">저장</button>
              <button type="button" onClick={() => reload(index)} className="rounded-md border border-black/15 px-2.5 py-1 dark:border-white/20">새로고침</button>
            </div>
            <p className="mt-2 min-h-5 text-xs text-foreground/60">{editor.message}</p>
          </section>
        ))}
      </div>
      <button type="button" onClick={reset} className="w-fit text-xs text-foreground/55 underline">처음부터 다시</button>
    </div>
  );
}
