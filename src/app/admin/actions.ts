"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { slugify, stripHtml } from "@/lib/utils";

async function ensureAdmin() {
  if (!(await isAdmin())) redirect("/login");
}

function buildExcerpt(content: string): string {
  const text = stripHtml(content);
  return text.length > 160 ? text.slice(0, 160) + "…" : text;
}

export async function createPost(formData: FormData) {
  await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const coverImage = String(formData.get("cover_image") ?? "").trim() || null;
  const coverPosition =
    String(formData.get("cover_position") ?? "").trim() || "50% 50%";
  const published = formData.get("published") === "on";

  if (!title) redirect("/admin/new?error=title");

  const slug = slugify(slugInput || title);
  const excerpt = buildExcerpt(content);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      content,
      excerpt,
      cover_image: coverImage,
      cover_position: coverPosition,
      published,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") redirect("/admin/new?error=slug");
    redirect(`/admin/new?error=unknown`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/posts/${data!.slug}`);
  redirect(`/admin?saved=created`);
}

export async function updatePost(id: string, formData: FormData) {
  await ensureAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const coverImage = String(formData.get("cover_image") ?? "").trim() || null;
  const coverPosition =
    String(formData.get("cover_position") ?? "").trim() || "50% 50%";
  const published = formData.get("published") === "on";

  if (!title) redirect(`/admin/${id}/edit?error=title`);

  const slug = slugify(slugInput || title);
  const excerpt = buildExcerpt(content);

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      content,
      excerpt,
      cover_image: coverImage,
      cover_position: coverPosition,
      published,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") redirect(`/admin/${id}/edit?error=slug`);
    redirect(`/admin/${id}/edit?error=unknown`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/posts/${slug}`);
  redirect(`/admin?saved=updated`);
}

export async function togglePublished(id: string) {
  await ensureAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("published")
    .eq("id", id)
    .single();
  if (!data) return;
  await supabase
    .from("posts")
    .update({ published: !data.published })
    .eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deletePost(id: string) {
  await ensureAdmin();
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function uploadCoverImage(formData: FormData): Promise<string> {
  await ensureAdmin();
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("파일이 없습니다.");

  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "png";
  const path = `covers/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}
