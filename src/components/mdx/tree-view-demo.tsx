"use client";

import { useState } from "react";

type TreeNode = { name: string; children?: TreeNode[] };

const tree: TreeNode = {
  name: "src",
  children: [
    {
      name: "app",
      children: [
        { name: "layout.tsx" },
        { name: "page.tsx" },
        { name: "posts", children: [{ name: "[slug]", children: [{ name: "page.tsx" }] }] },
      ],
    },
    {
      name: "components",
      children: [{ name: "mdx", children: [{ name: "tree-view-demo.tsx" }] }],
    },
    { name: "lib", children: [{ name: "posts.ts" }, { name: "categories.ts" }] },
  ],
};

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  const isDir = !!node.children;
  const [open, setOpen] = useState(depth < 1);

  return (
    <div>
      <button
        onClick={() => isDir && setOpen((o) => !o)}
        style={{ paddingLeft: depth * 16 + 4 }}
        className="flex w-full items-center gap-1.5 rounded py-0.5 text-left text-sm hover:bg-foreground/[0.05]"
      >
        <span className="w-3 text-foreground/40">
          {isDir ? (open ? "▾" : "▸") : ""}
        </span>
        <span>{isDir ? "📁" : "📄"}</span>
        <span className={isDir ? "font-medium" : "text-foreground/80"}>{node.name}</span>
      </button>
      {isDir && open && (
        <div>
          {node.children!.map((child) => (
            <Node key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeViewDemo() {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="rounded-md border border-black/10 p-2 dark:border-white/15">
        <Node node={tree} depth={0} />
      </div>
      <p className="text-xs text-foreground/50">
        폴더를 클릭해 펼치고 접어 보세요. 깊이에 상관없이 <b>같은 컴포넌트가
        자기 자신을 재귀 호출</b>해 그려집니다.
      </p>
    </div>
  );
}
