import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig, siteUrl } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBox } from "@/components/search-box";
import { MobileNav } from "@/components/mobile-nav";
import { CategorySidebar } from "@/components/category-sidebar";
import { getCategoryCounts } from "@/lib/posts";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name }],
  verification: {
    google: "gyxyRGklNNqsGvKjtrP7fQnkxC4Qv1Ro6_0vW0JncFY",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarItems = getCategoryCounts().map(({ category, count }) => ({
    id: category.id,
    label: category.label,
    count,
  }));

  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <header className="sticky top-0 z-40 bg-background border-b border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <Link
              href="/"
              className="min-w-0 truncate font-semibold tracking-tight"
            >
              {siteConfig.name}
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <nav className="hidden items-center gap-4 text-sm text-foreground/70 md:flex">
                <Link href="/" className="hover:text-foreground transition-colors">
                  글 목록
                </Link>
                <Link
                  href="/categories"
                  className="hover:text-foreground transition-colors"
                >
                  카테고리
                </Link>
                <Link
                  href="/tags"
                  className="hover:text-foreground transition-colors"
                >
                  태그
                </Link>
                <Link
                  href="/guestbook"
                  className="hover:text-foreground transition-colors"
                >
                  방명록
                </Link>
              </nav>
              <SearchBox />
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="hidden lg:block w-60 shrink-0 border-r border-black/10 dark:border-white/10">
            <div className="sticky top-20 p-6">
              <CategorySidebar items={sidebarItems} />
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">{children}</div>
          </main>
        </div>

        <footer className="sticky bottom-0 z-40 bg-background border-t border-black/10 dark:border-white/10">
          <div className="px-4 py-5 text-sm sm:px-6 sm:py-6 text-foreground/60 flex items-center justify-between">
            <span>
              © {new Date().getFullYear()} {siteConfig.author.name}
            </span>
            <Link href="/feed.xml" className="hover:text-foreground transition-colors">
              RSS
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
