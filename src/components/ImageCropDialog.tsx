"use client";

import { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Props = {
  src: string;
  onCancel: () => void;
  onApply: (blob: Blob) => Promise<void> | void;
};

async function renderCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scaleX));
  canvas.height = Math.max(1, Math.round(crop.height * scaleY));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.95,
    );
  });
}

export default function ImageCropDialog({ src, onCancel, onApply }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop(
        { unit: "%", width: 80 },
        img.width / img.height,
        img.width,
        img.height,
      ),
      img.width,
      img.height,
    );
    setCrop(initial);
  };

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop || completedCrop.width < 4) {
      onCancel();
      return;
    }
    setBusy(true);
    try {
      const blob = await renderCroppedBlob(imgRef.current, completedCrop);
      await onApply(blob);
    } catch (e) {
      alert(`자르기 실패: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-semibold">이미지 자르기</h3>
          <p className="text-xs text-[var(--muted)]">
            모서리/변을 드래그하면 자유 비율로 조정됩니다
          </p>
        </div>

        <div className="flex-1 overflow-auto p-5 bg-zinc-50 flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="crop source"
              crossOrigin="anonymous"
              onLoad={onImgLoad}
              className="max-h-[60vh]"
            />
          </ReactCrop>
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-zinc-50 cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={busy || !completedCrop}
            className="text-sm px-4 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
          >
            {busy ? "적용 중…" : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
