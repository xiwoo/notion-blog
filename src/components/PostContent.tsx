'use client';

import React from 'react';
import { renderBlock } from '@/components/notion-renderer';
import { NotionBlock } from '@/types/notion';

interface PostContentProps {
  content: NotionBlock[]; // Notion에서 조회한 컨텐츠 데이터 (블록 배열)
}

const PostContent: React.FC<PostContentProps> = ({ content }) => {
  // 헤딩 블록 수집 (CSR 컴포넌트 내부에서 처리)
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
  );
};

export default PostContent;