"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

type ImageActionsStorage = {
  onCrop: ((src: string, pos: number) => void) | null;
};

export default function BlogImageNodeView({
  node,
  editor,
  getPos,
  deleteNode,
  selected,
}: NodeViewProps) {
  const src = (node.attrs.src as string) ?? "";
  const alt = (node.attrs.alt as string | null) ?? "";

  const handleCrop = () => {
    if (typeof getPos !== "function") return;
    const pos = getPos();
    if (pos == null) return;
    const storage = (editor.storage as unknown as {
      imageActions?: ImageActionsStorage;
    }).imageActions;
    storage?.onCrop?.(src, pos);
  };

  return (
    <NodeViewWrapper className="my-4 leading-none">
      <span
        className={`relative inline-block max-w-full rounded-xl overflow-hidden group align-top ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="block max-w-full h-auto rounded-xl"
        />
        <span className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCrop}
            title="자르기"
            className="bg-black/80 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-md cursor-pointer shadow"
          >
            ✂️ 자르기
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => deleteNode()}
            title="이미지 삭제"
            className="bg-black/80 hover:bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-md cursor-pointer shadow"
          >
            🗑️
          </button>
        </span>
      </span>
    </NodeViewWrapper>
  );
}
