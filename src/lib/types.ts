export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  cover_position: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};
