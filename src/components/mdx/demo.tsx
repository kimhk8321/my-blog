"use client";

export function Demo({
  title = "라이브 데모",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
      <div className="flex items-center gap-2 border-b border-black/10 bg-foreground/[0.03] px-4 py-2 text-xs font-medium text-foreground/50 dark:border-white/15">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        {title}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
