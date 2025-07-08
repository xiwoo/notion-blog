// app/blog/[slug]/page.tsx
import { getPostContent } from '@/lib/notion';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { renderBlock, } from "@/components/notion-renderer";
import { NotionBlock } from '@/types/notion';

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

  // 헤딩 블록 수집
  const headings = content.filter(
    (block: NotionBlock) =>
      block.type === 'heading_1' ||
      block.type === 'heading_2' ||
      block.type === 'heading_3'
  ).map((block: NotionBlock) => {
    let text = '';
    if (block.type === 'heading_1' && block.heading_1) {
      text = block.heading_1.rich_text[0]?.plain_text || '';
    } else if (block.type === 'heading_2' && block.heading_2) {
      text = block.heading_2.rich_text[0]?.plain_text || '';
    } else if (block.type === 'heading_3' && block.heading_3) {
      text = block.heading_3.rich_text[0]?.plain_text || '';
    }
    return {
      id: block.id,
      text: text,
      level: parseInt(block.type.replace('heading_', '')),
    };
  });

  return (
    <article className="container mx-auto py-12 max-w-3xl">
      <h1 className="text-5xl font-extrabold mb-4">
        {page.properties.title.title?.at(0)?.plain_text}
      </h1>
      <p className="text-muted-foreground mb-8">
        {new Date(page.created_time).toLocaleDateString()}
      </p>

      <section className='flex flex-col gap-1'>
        {content.map((block) => {

          if (block.type === 'table_of_contents') {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const tableOfContentsDepth = ["ml-4", "ml-8", "ml-12"]; //heading level은 3까지로 제한되어있다.
            return (
              <div key={block.id} className="my-4 p-4 bg-gray-50 rounded-md">
                <h2 className="text-xl font-bold mb-2">Table of Contents</h2>
                <ul className="list-inside list-disc">
                  {headings.map((heading: { id: string, text: string, level: number }) => (
                    <li key={heading.id} className={`ml-${(heading.level - 1) * 4}`}> {/* 상단 tableOfContentsDepth 선언만 되어있어도 충분 */}
                      <a href={`#${heading.id}`} className={`text-${block.table_of_contents?.color}-600 hover:underline`}>
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return <div key={block.id}>{renderBlock(block)}</div>;
        })}
      </section>
    </article>
  );
}