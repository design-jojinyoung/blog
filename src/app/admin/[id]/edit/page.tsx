import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { updatePost } from "../../actions";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ error?: string }>;

const errorMessages: Record<string, string> = {
  title: "제목을 입력해 주세요.",
  slug: "이미 같은 URL 주소를 가진 글이 있습니다.",
  unknown: "저장 중 알 수 없는 오류가 발생했습니다.",
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single();

  const post = (data ?? null) as Post | null;
  if (!post) notFound();

  const update = updatePost.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">글 수정</h1>
      <PostForm
        initial={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          cover_image: post.cover_image,
          published: post.published,
        }}
        action={update}
        submitLabel="수정 저장"
        errorMessage={error ? errorMessages[error] : undefined}
      />
    </div>
  );
}
