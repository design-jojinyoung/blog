import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { deletePost } from "./actions";
import DeleteButton from "@/components/DeleteButton";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as Post[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            글을 작성하거나 수정/삭제할 수 있습니다.
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          + 새 글
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="text-[var(--muted)]">아직 글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
          {list.map((post) => (
            <li
              key={post.id}
              className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-zinc-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/posts/${encodeURIComponent(post.slug)}`}
                    className="font-medium hover:underline truncate"
                  >
                    {post.title}
                  </Link>
                  {post.published ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0">
                      공개
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                      초안
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {formatDate(post.created_at)} · /{post.slug}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/${post.id}/edit`}
                  className="text-sm px-3 py-1.5 rounded border border-[var(--border)] hover:bg-zinc-100 transition-colors"
                >
                  수정
                </Link>
                <DeleteButton
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
