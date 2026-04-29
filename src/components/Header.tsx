import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function Header() {
  const admin = await isAdmin();

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-[700px] px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          한번 뿐인 내 인생
        </Link>
        <nav className="text-sm text-[var(--muted)] flex items-center gap-5">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            글
          </Link>
          {admin ? (
            <>
              <Link href="/admin" className="hover:text-[var(--foreground)] transition-colors">
                관리
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
