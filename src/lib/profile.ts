import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: number;
  name: string;
  photo: string | null;
  bio: string;
  updated_at: string;
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return (data ?? null) as Profile | null;
}
