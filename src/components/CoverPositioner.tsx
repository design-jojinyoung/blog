"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  position: string;
  onChange: (next: string) => void;
};

function parsePos(p: string): { x: number; y: number } {
  const m = p.match(/(-?\d+(?:\.\d+)?)\s*%\s+(-?\d+(?:\.\d+)?)\s*%/);
  if (!m) return { x: 50, y: 50 };
  return { x: clamp(Number(m[1]), 0, 100), y: clamp(Number(m[2]), 0, 100) };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function CoverPositioner({ url, position, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{
    px: number;
    py: number;
    posX: number;
    posY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const { x, y } = parsePos(position);

  const beginDrag = (px: number, py: number) => {
    setDragging(true);
    startRef.current = { px, py, posX: x, posY: y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (clientX: number, clientY: number) => {
      const start = startRef.current;
      const el = containerRef.current;
      if (!start || !el) return;
      const rect = el.getBoundingClientRect();
      const dx = ((clientX - start.px) / rect.width) * 100;
      const dy = ((clientY - start.py) / rect.height) * 100;
      const nextX = clamp(start.posX - dx, 0, 100);
      const nextY = clamp(start.posY - dy, 0, 100);
      onChange(`${nextX.toFixed(1)}% ${nextY.toFixed(1)}%`);
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging, onChange]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative aspect-[16/8] overflow-hidden rounded-xl bg-[var(--border)] select-none"
        onMouseDown={(e) => {
          e.preventDefault();
          beginDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) beginDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="cover preview"
          draggable={false}
          className={`absolute inset-0 w-full h-full object-cover ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ objectPosition: `${x}% ${y}%` }}
        />
        <div className="pointer-events-none absolute top-2 left-2 text-[11px] bg-black/60 text-white px-2 py-1 rounded">
          드래그해서 위치 조정
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>위치: {x.toFixed(0)}% / {y.toFixed(0)}%</span>
        <button
          type="button"
          onClick={() => onChange("50% 50%")}
          className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
        >
          가운데로 초기화
        </button>
      </div>
    </div>
  );
}
