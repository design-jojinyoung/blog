"use client";

import { useTransition } from "react";

type Props = {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
};

export default function DeleteButton({
  action,
  label = "삭제",
  confirmText = "정말 삭제하시겠어요? 되돌릴 수 없습니다.",
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          startTransition(() => {
            action();
          });
        }
      }}
      className="text-sm px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
    >
      {pending ? "삭제 중…" : label}
    </button>
  );
}
