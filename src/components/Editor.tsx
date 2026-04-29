"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor as TipTapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { createClient } from "@/lib/supabase/client";
import { prepareImageForUpload } from "@/lib/image";
import ImageCropDialog from "./ImageCropDialog";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  active,
  onClick,
  disabled,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`px-2.5 h-8 rounded text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-black text-white"
          : "hover:bg-zinc-100 text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

async function uploadBlob(blob: Blob, ext = "jpg"): Promise<string> {
  const supabase = createClient();
  const path = `posts/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const file =
    blob instanceof File
      ? blob
      : new File([blob], `image.${ext}`, { type: blob.type || "image/jpeg" });
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}

function Toolbar({
  editor,
  onRequestCrop,
}: {
  editor: TipTapEditor | null;
  onRequestCrop: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAndInsert = useCallback(
    async (raw: File) => {
      if (!editor) return;
      let file: File;
      try {
        file = await prepareImageForUpload(raw);
      } catch (e) {
        alert(`이미지 변환 실패 (HEIC 등): ${(e as Error).message}`);
        return;
      }
      try {
        const ext = file.name.split(".").pop() ?? "png";
        const url = await uploadBlob(file, ext);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (e) {
        alert(`이미지 업로드 실패: ${(e as Error).message}`);
      }
    },
    [editor],
  );

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAndInsert(file);
    e.target.value = "";
  };

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("링크 주소를 입력하세요", previous);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  const imageSelected = editor.isActive("image");

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] px-2 py-2 sticky top-0 bg-white z-10">
      <ToolbarButton
        title="제목 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        title="제목 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="제목 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </ToolbarButton>
      <span className="w-px h-5 bg-[var(--border)] mx-1" />
      <ToolbarButton
        title="굵게"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        title="기울임"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        title="취소선"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <span className="w-px h-5 bg-[var(--border)] mx-1" />
      <ToolbarButton
        title="글머리 기호"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </ToolbarButton>
      <ToolbarButton
        title="번호 목록"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        title="인용"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “
      </ToolbarButton>
      <ToolbarButton
        title="코드"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </ToolbarButton>
      <span className="w-px h-5 bg-[var(--border)] mx-1" />
      <ToolbarButton
        title="링크"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        🔗
      </ToolbarButton>
      <ToolbarButton title="이미지 추가" onClick={onPickImage}>
        🖼️
      </ToolbarButton>
      <ToolbarButton
        title={
          imageSelected
            ? "선택한 이미지 자르기"
            : "이미지를 클릭한 뒤 사용하세요"
        }
        onClick={onRequestCrop}
        disabled={!imageSelected}
      >
        ✂️
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

export default function Editor({ value, onChange }: Props) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "여기에 글을 작성하세요…" }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[400px] px-5 py-5 focus:outline-none text-[1.05rem] leading-[1.75]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value && editor.getHTML() === "<p></p>") {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const handleRequestCrop = () => {
    if (!editor) return;
    const src = editor.getAttributes("image")?.src as string | undefined;
    if (!src) return;
    setCropSrc(src);
  };

  const handleCropApply = async (blob: Blob) => {
    if (!editor) return;
    try {
      const url = await uploadBlob(blob, "jpg");
      editor.chain().focus().updateAttributes("image", { src: url }).run();
    } catch (e) {
      alert(`업로드 실패: ${(e as Error).message}`);
    } finally {
      setCropSrc(null);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
      <Toolbar editor={editor} onRequestCrop={handleRequestCrop} />
      <EditorContent editor={editor} />
      {cropSrc ? (
        <ImageCropDialog
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onApply={handleCropApply}
        />
      ) : null}
    </div>
  );
}
