import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { login } from "./actions";

type SearchParams = Promise<{ error?: string }>;

const errorMessages: Record<string, string> = {
  missing: "이메일과 비밀번호를 입력해 주세요.",
  invalid: "이메일 또는 비밀번호가 올바르지 않습니다.",
  forbidden: "관리자 계정이 아닙니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  if (await isAdmin()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-bold tracking-tight">관리자 로그인</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        본인만 접근할 수 있는 페이지입니다.
      </p>

      <form action={login} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        {error && errorMessages[error] ? (
          <p className="text-sm text-red-600">{errorMessages[error]}</p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
