// src/types/post.ts

export interface Post {
  id: string;
  pageId: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  category?: string;
}

export interface PostWithCategory {
  id: string;
  title: string;
  slug: string;
  category?: string;
}
