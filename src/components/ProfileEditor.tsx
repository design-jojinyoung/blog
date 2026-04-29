"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { prepareImageForUpload } from "@/lib/image";
import type { Profile } from "@/lib/profile";

type Props = {
  initial: Profile | null;
  action: (formData: FormData) => Promise<void>;
};

export default function ProfileEditor({ initial, action }: Props) {
  const [name, setName] = useState(initial?.name ?? "진영");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = "";
    if (!raw) return;

    setUploading(true);
    try {
      let file: File;
      try {
        file = await prepareImageForUpload(raw);
      } catch (err) {
        alert(`이미지 변환 실패: ${(err as Error).message}`);
        return;
      }
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `profile/${Date.now()}-${Math.random()
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
      setPhoto(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("bio", bio);
    if (photo) fd.set("photo", photo);
    startTransition(() => {
      action(fd);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-col items-center gap-3">
        {photo ? (
          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-[var(--border)] ring-1 ring-[var(--border)]">
            <Image
              src={photo}
              alt="profile"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
            no photo
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="text-sm px-3.5 py-2 rounded-lg border border-[var(--border)] hover:bg-zinc-50 cursor-pointer disabled:opacity-50"
          >
            {uploading
              ? "업로드 중…"
              : photo
                ? "사진 변경"
                : "사진 업로드"}
          </button>
          {photo ? (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
            >
              제거
            </button>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
          이름
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-2xl font-semibold tracking-tight rounded-lg border border-[var(--border)] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
          소개
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={8}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="나에 대한 소개를 자유롭게 적어주세요."
          className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[1rem] leading-[1.7] focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-lg bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
