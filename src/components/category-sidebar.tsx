"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface CategorySidebarItem {
  id: string;
  label: string;
  count: number;
}

export function CategorySidebar({ items }: { items: CategorySidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="카테고리" className="text-sm">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        카테고리
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/categories"
            className={linkClass(pathname === "/categories")}
          >
            <span>전체 보기</span>
          </Link>
        </li>
        {items.map((item) => {
          const href = `/categories/${item.id}`;
          const active = pathname === href;
          return (
            <li key={item.id}>
              <Link href={href} className={linkClass(active)}>
                <span className="truncate">{item.label}</span>
                <span
                  className={
                    active ? "text-foreground/60" : "text-foreground/35"
                  }
                >
                  {item.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function linkClass(active: boolean): string {
  return [
    "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 transition-colors",
    active
      ? "bg-foreground/[0.07] font-medium text-foreground"
      : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground",
  ].join(" ");
}
