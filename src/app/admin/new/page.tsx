import PostForm from "@/components/PostForm";
import { createPost } from "../actions";

type SearchParams = Promise<{ error?: string }>;

const errorMessages: Record<string, string> = {
  title: "제목을 입력해 주세요.",
  slug: "이미 같은 URL 주소를 가진 글이 있습니다. 다른 주소를 사용해 주세요.",
  unknown: "저장 중 알 수 없는 오류가 발생했습니다.",
};

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">새 글 작성</h1>
      <PostForm
        action={createPost}
        submitLabel="저장"
        errorMessage={error ? errorMessages[error] : undefined}
      />
    </div>
  );
}
