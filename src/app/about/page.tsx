import { getProfile } from "@/lib/profile";
import { isAdmin } from "@/lib/auth";
import ProfileView from "@/components/ProfileView";
import ProfileEditor from "@/components/ProfileEditor";
import Toast from "@/components/Toast";
import { saveProfile } from "./actions";

export const revalidate = 0;

type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function AboutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { saved, error } = await searchParams;
  const profile = await getProfile();
  const admin = await isAdmin();

  const toastMessage = saved
    ? "프로필이 저장되었습니다"
    : error
      ? "저장 중 오류가 발생했습니다"
      : null;

  return (
    <div className="mx-auto max-w-[700px] px-6 py-16">
      <Toast message={toastMessage} />
      {admin ? (
        <>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-6">
            관리자 편집 모드
          </p>
          <ProfileEditor initial={profile} action={saveProfile} />
        </>
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
}
