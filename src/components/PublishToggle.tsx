"use client";

import { useTransition, useState } from "react";

type Props = {
  published: boolean;
  action: () => Promise<void>;
};

export default function PublishToggle({ published, action }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(published);
  const current = pending ? optimistic : published;

  const onClick = () => {
    setOptimistic(!published);
    startTransition(() => {
      action();
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title={
        current
          ? "공개 중 — 클릭하면 비공개로"
          : "비공개 — 클릭하면 공개로"
      }
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
        current ? "bg-emerald-500" : "bg-zinc-300"
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${
          current ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
