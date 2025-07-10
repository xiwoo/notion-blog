import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPublishedPosts, getPostBySlug, getPostContent } from '@/lib/notion';

import PostContent from '@/components/PostContent';

interface PostingPageProps {
  params: Promise<{ slug: string }>
}

// SSG를 위한 generateStaticParams 함수
export async function generateStaticParams() {
  const posts = await getPublishedPosts(); // 모든 게시물 가져오기

  // 각 게시물의 slug를 기반으로 params 배열 생성
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PostingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) {
    return {};
  }

  const { post } = data;
  const title = post.properties.Title.title?.at(0)?.plain_text;
  const description = post.properties.Description?.rich_text?.at(0)?.plain_text || title;
  const tags = post.properties.Tags.multi_select?.map((tag: {name: string}) => tag.name);

  return {
    title: title,
    description: description,
    keywords: tags,
  };
}

export default async function PostingPage({ params }: PostingPageProps) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) {
    notFound();
  }

  const { pageId } = data;
  const { page, content } = await getPostContent(pageId);

  return (
    <article className="container mx-auto py-12 max-w-3xl">
      <h1 className="text-5xl font-extrabold mb-4">
        {page.properties.title.title?.at(0)?.plain_text}
      </h1>
      <p className="text-muted-foreground mb-8">
        {new Date(page.created_time).toLocaleDateString()}
      </p>

      <PostContent content={content} />
    </article>
  );
}