"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function saveProfile(formData: FormData) {
  if (!(await isAdmin())) redirect("/login");

  const name = String(formData.get("name") ?? "").trim() || "진영";
  const photo = String(formData.get("photo") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile")
    .upsert({ id: 1, name, photo, bio });

  if (error) {
    redirect("/about?error=save");
  }

  revalidatePath("/about");
  redirect("/about?saved=1");
}
