import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const revalidate = 0;

type Params = Promise<{ slug: string }>;

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const supabase = await createClient();
  const admin = await isAdmin();

  const query = supabase.from("posts").select("*").eq("slug", decoded).limit(1);
  const { data } = admin ? await query : await query.eq("published", true);

  const post = (data?.[0] ?? null) as Post | null;
  if (!post) notFound();

  return (
    <article>
      {post.cover_image ? (
        <div className="relative w-full aspect-[21/9] sm:aspect-[16/6] bg-[var(--border)]">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-[700px] px-6">
        <header className={`${post.cover_image ? "pt-12" : "pt-16"} pb-10 text-center`}>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <span aria-hidden>←</span> 글 목록
          </Link>
          <time className="block text-sm uppercase tracking-widest text-[var(--muted)]">
            {formatDate(post.created_at)}
          </time>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
            {post.title}
          </h1>
          {!post.published ? (
            <p className="mt-5 inline-block text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-800">
              비공개 (초안)
            </p>
          ) : null}
          <div className="mt-10 mx-auto h-px w-12 bg-[var(--border)]" />
        </header>

        <div
          className="prose prose-zinc prose-lg max-w-none prose-img:rounded-xl prose-headings:tracking-tight prose-a:text-blue-600 prose-p:leading-[1.85] pb-20"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
