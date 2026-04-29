"use client";

import { useState, useTransition, useRef } from "react";
import Editor from "./Editor";
import CoverPositioner from "./CoverPositioner";
import { createClient } from "@/lib/supabase/client";
import { prepareImageForUpload } from "@/lib/image";

type Initial = {
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  cover_position: string;
  published: boolean;
};

type Props = {
  initial?: Initial;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  errorMessage?: string;
};

export default function PostForm({
  initial,
  action,
  submitLabel,
  errorMessage,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    initial?.cover_image ?? null,
  );
  const [coverPosition, setCoverPosition] = useState<string>(
    initial?.cover_position ?? "50% 50%",
  );
  const [published, setPublished] = useState(initial?.published ?? false);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverPick = () => coverInputRef.current?.click();

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = "";
    if (!raw) return;

    setUploading(true);
    try {
      let file: File;
      try {
        file = await prepareImageForUpload(raw);
      } catch (err) {
        alert(`이미지 변환 실패 (HEIC 등): ${(err as Error).message}`);
        return;
      }
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `covers/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("blog-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        alert(`업로드 실패: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setCoverImage(data.publicUrl);
      setCoverPosition("50% 50%");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    if (coverImage) {
      formData.set("cover_image", coverImage);
      formData.set("cover_position", coverPosition);
    } else {
      formData.delete("cover_image");
      formData.set("cover_position", "50% 50%");
    }
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMessage ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">
          {errorMessage}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1.5">
          제목
        </label>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full text-2xl font-semibold tracking-tight rounded-lg border border-[var(--border)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
          URL 주소{" "}
          <span className="text-[var(--muted)] font-normal">
            (선택, 비워두면 제목으로 자동 생성)
          </span>
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-first-post"
          className="w-full rounded-lg border border-[var(--border)] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">대표 이미지</label>
        {coverImage ? (
          <div className="mb-3 space-y-2">
            <CoverPositioner
              url={coverImage}
              position={coverPosition}
              onChange={setCoverPosition}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCoverImage(null)}
                className="text-xs text-red-600 hover:text-red-700 cursor-pointer"
              >
                이미지 제거
              </button>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleCoverPick}
          disabled={uploading}
          className="text-sm px-3.5 py-2 rounded-lg border border-[var(--border)] hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading
            ? "업로드 중…"
            : coverImage
              ? "이미지 변경"
              : "이미지 업로드"}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverFile}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">본문</label>
        <Editor value={content} onChange={setContent} />
      </div>

      <label className="flex items-center gap-2 select-none">
        <input
          type="checkbox"
          name="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="size-4"
        />
        <span className="text-sm">공개로 발행</span>
        <span className="text-xs text-[var(--muted)] ml-1">
          (꺼두면 본인만 볼 수 있는 초안으로 저장)
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-lg bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          {pending ? "저장 중…" : submitLabel}
        </button>
        <a
          href="/admin"
          className="text-sm px-4 py-2.5 rounded-lg border border-[var(--border)] hover:bg-zinc-50 transition-colors"
        >
          취소
        </a>
      </div>
    </form>
  );
}
