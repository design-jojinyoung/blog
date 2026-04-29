"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  message: string | null;
  durationMs?: number;
};

export default function Toast({ message, durationMs = 3000 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(!!message);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    setLeaving(false);
    const fadeT = setTimeout(() => setLeaving(true), durationMs - 300);
    const hideT = setTimeout(() => {
      setVisible(false);
      router.replace(pathname);
    }, durationMs);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(hideT);
    };
  }, [message, durationMs, router, pathname]);

  if (!visible || !message) return null;

  return (
    <div
      className={`fixed top-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg z-50 text-sm font-medium transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      ✓ {message}
    </div>
  );
}
