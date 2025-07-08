// app/blog/[slug]/page.tsx
import { getPostBySlug, getPostContent } from '@/lib/notion';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { renderBlock } from '@/components/notion-renderer';
import { NotionBlock } from '@/types/notion';

interface PostingPageProps {
  params: Promise<{ slug: string }>
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

  // data 객체에서 post 메타데이터와 pageId를 분리합니다.
  const { pageId } = data;

  // pageId로 실제 본문 내용을 가져옵니다
  const { page, content } = await getPostContent(pageId);

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
        {content.map((block: NotionBlock) => {

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