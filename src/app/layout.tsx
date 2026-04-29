import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "한번 뿐인 내 인생",
  description: "솔직하고 뜨겁게 하지만 겸손하게.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] mt-16">
          <div className="mx-auto max-w-[700px] px-6 py-8 text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} 한번 뿐인 내 인생
          </div>
        </footer>
      </body>
    </html>
  );
}
