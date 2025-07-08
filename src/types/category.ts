// src/types/category.ts

export interface PostNode {
  type: 'post';
  id: string;
  title: string;
  slug: string;
}

export interface TreeNode {
  type: 'category';
  children: { [key: string]: TreeNode | PostNode };
}
