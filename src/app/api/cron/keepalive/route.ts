import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron이 매일 호출하는 엔드포인트.
// 단순히 Supabase에 'select count' 한 번 날려서 프로젝트를 활성 상태로 유지시킴.
// 결과: Supabase 무료 플랜의 7일 비활성 → 자동 일시정지를 영구 방지.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // CRON_SECRET이 설정되어 있으면 Vercel Cron의 인증 헤더를 검증.
  // 설정 안 되어 있어도 작동은 함 (단순 카운트 쿼리이므로 노출되어도 위험 없음).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase env vars" },
      { status: 500 },
    );
  }

  const supabase = createClient(url, key);

  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    posts: count ?? 0,
    at: new Date().toISOString(),
  });
}
