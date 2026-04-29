import Image from "next/image";
import type { Profile } from "@/lib/profile";

export default function ProfileView({ profile }: { profile: Profile | null }) {
  const name = profile?.name ?? "진영";
  const photo = profile?.photo ?? null;
  const bio = profile?.bio ?? "";

  return (
    <div className="space-y-8">
      {photo ? (
        <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden bg-[var(--border)] ring-1 ring-[var(--border)]">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="160px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
          no photo
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
      </div>

      {bio.trim() ? (
        <div className="prose prose-zinc max-w-none mx-auto whitespace-pre-wrap text-center sm:text-left">
          {bio}
        </div>
      ) : (
        <p className="text-center text-[var(--muted)]">
          아직 소개가 없습니다.
        </p>
      )}
    </div>
  );
}
