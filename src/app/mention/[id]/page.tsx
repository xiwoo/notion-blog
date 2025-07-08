
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPostContent } from '@/lib/notion';

import PostContent from '@/components/PostContent';

interface MentionPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 3600;

export async function generateMetadata({ params }: MentionPageProps ): Promise<Metadata> {
  const { id } = await params;
  const { page, content } = await getPostContent(id);
  if (!page || !content) {
    return {};
  }

  const title = page.properties.title.title?.at(0)?.plain_text;
  const description = title;

  return {
    title: title,
    description: description,
    // keywords: tags,
  };
}

export default async function MentionPage({ params }: MentionPageProps) {
  const { id } = await params;
  // pageId로 실제 본문 내용을 가져옵니다
  const { page, content } = await getPostContent(id);
  if (!page || !content) {
    notFound();
  }

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