import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";
import { deletePost, togglePublished } from "./actions";
import DeleteButton from "@/components/DeleteButton";
import PublishToggle from "@/components/PublishToggle";
import Toast from "@/components/Toast";

export const revalidate = 0;

type SearchParams = Promise<{ saved?: string }>;

const savedMessages: Record<string, string> = {
  created: "글이 저장되었습니다",
  updated: "글이 수정되었습니다",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { saved } = await searchParams;
  const toastMessage = saved ? savedMessages[saved] ?? null : null;

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as Post[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Toast message={toastMessage} />

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
              <PublishToggle
                published={post.published}
                action={async () => {
                  "use server";
                  await togglePublished(post.id);
                }}
              />

              <div className="flex-1 min-w-0">
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  className="font-medium hover:underline truncate block"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {formatDate(post.created_at)} · /{post.slug} ·{" "}
                  <span className={post.published ? "text-emerald-700" : "text-amber-700"}>
                    {post.published ? "공개" : "비공개"}
                  </span>
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
