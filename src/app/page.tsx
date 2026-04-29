import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types";

export const revalidate = 0;

function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/posts/${encodeURIComponent(post.slug)}`}
      className="group block"
    >
      {post.cover_image ? (
        <div
          className={`relative ${
            large ? "aspect-[16/8]" : "aspect-[4/3]"
          } mb-4 overflow-hidden rounded-xl bg-[var(--border)]`}
        >
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 768px" : "(max-width: 768px) 100vw, 360px"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div
          className={`relative ${
            large ? "aspect-[16/8]" : "aspect-[4/3]"
          } mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center`}
        >
          <span className="text-zinc-400 text-sm">no image</span>
        </div>
      )}
      <time className="text-xs uppercase tracking-wider text-[var(--muted)]">
        {formatDate(post.created_at)}
      </time>
      <h2
        className={`mt-2 ${
          large ? "text-3xl" : "text-xl"
        } font-semibold tracking-tight group-hover:underline underline-offset-4 decoration-2`}
      >
        {post.title}
      </h2>
      {post.excerpt ? (
        <p
          className={`mt-2 text-[var(--muted)] ${
            large ? "line-clamp-3" : "line-clamp-2"
          } text-sm leading-relaxed`}
        >
          {post.excerpt}
        </p>
      ) : null}
    </Link>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as Post[];
  const [featured, ...rest] = list;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight">jinyoung&apos;s blog</h1>
        <p className="mt-4 text-lg text-[var(--muted)]">기록하고 공유하는 곳.</p>
      </section>

      {list.length === 0 ? (
        <p className="text-[var(--muted)]">아직 작성된 글이 없습니다.</p>
      ) : (
        <>
          {featured ? (
            <section className="mb-16 pb-16 border-b border-[var(--border)]">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-5">
                Featured
              </p>
              <PostCard post={featured} large />
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-5">
                More posts
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                {rest.map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
