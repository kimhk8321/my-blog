import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig, siteUrl } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

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
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto w-full max-w-3xl px-6 py-5 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              {siteConfig.name}
            </Link>
            <nav className="flex items-center gap-4 text-sm text-foreground/70">
              <Link href="/" className="hover:text-foreground transition-colors">
                글 목록
              </Link>
              <Link
                href="/tags"
                className="hover:text-foreground transition-colors"
              >
                태그
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
          {children}
        </main>

        <footer className="border-t border-black/10 dark:border-white/10">
          <div className="mx-auto w-full max-w-3xl px-6 py-6 text-sm text-foreground/60 flex items-center justify-between">
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
