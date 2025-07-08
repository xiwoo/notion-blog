// lib/category-utils.ts

import { PostWithCategory } from '@/types/post';
import { TreeNode } from '@/types/category';

export const buildCategoryTree = (posts: PostWithCategory[]): TreeNode => {
  const tree: TreeNode = { type: 'category', children: {} };

  posts.forEach(post => {
    const categoryPath = post.category || 'Uncategorized';
    const parts = categoryPath.split('/');
    let currentNode = tree.children;

    parts.forEach((part, index) => {
      // 경로의 마지막 부분이면 글(Post) 노드를 추가
      if (index === parts.length - 1) {
        if (!currentNode[part]) {
          currentNode[part] = { type: 'category', children: {} };
        }
        (currentNode[part] as TreeNode).children[post.title] = {
          type: 'post',
          id: post.id,
          title: post.title,
          slug: post.slug,
        };
      } else {
        // 중간 경로이면 카테고리(Tree) 노드를 추가하거나 탐색
        if (!currentNode[part]) {
          currentNode[part] = { type: 'category', children: {} };
        }
        currentNode = (currentNode[part] as TreeNode).children;
      }
    });
  });

  return tree;
};