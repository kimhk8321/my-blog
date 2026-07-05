"use client";

import { useState } from "react";

const justifyOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
] as const;
const alignOptions = ["stretch", "flex-start", "center", "flex-end"] as const;
const directionOptions = ["row", "column"] as const;

const sel =
  "rounded-md border border-black/15 bg-background px-2 py-1 text-xs dark:border-white/20";

export function FlexboxDemo() {
  const [justify, setJustify] =
    useState<(typeof justifyOptions)[number]>("flex-start");
  const [align, setAlign] = useState<(typeof alignOptions)[number]>("stretch");
  const [direction, setDirection] =
    useState<(typeof directionOptions)[number]>("row");

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-1">
          flex-direction
          <select className={sel} value={direction} onChange={(e) => setDirection(e.target.value as never)}>
            {directionOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">
          justify-content
          <select className={sel} value={justify} onChange={(e) => setJustify(e.target.value as never)}>
            {justifyOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1">
          align-items
          <select className={sel} value={align} onChange={(e) => setAlign(e.target.value as never)}>
            {alignOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: direction,
          justifyContent: justify,
          alignItems: align,
          height: 180,
          gap: 8,
        }}
        className="rounded-md border border-black/10 bg-foreground/[0.03] p-2 dark:border-white/15"
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{ height: 30 + n * 22 }}
            className="flex items-center justify-center rounded bg-indigo-500/70 px-5 text-xs font-medium text-white"
          >
            {n}
          </div>
        ))}
      </div>

      <pre className="not-prose overflow-x-auto rounded-md bg-foreground/[0.05] p-3 text-xs">
        {`display: flex;
flex-direction: ${direction};
justify-content: ${justify};
align-items: ${align};`}
      </pre>
    </div>
  );
}
