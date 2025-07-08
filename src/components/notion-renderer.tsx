import Image from 'next/image';
import Link from 'next/link';
import { NotionBlock, RichTextItem } from '@/types/notion';

// Rich Text를 렌더링하는 헬퍼 함수
export const renderRichText = (richText: RichTextItem[]) => {
  return richText.map((text: RichTextItem, index: number) => {
    const annotations = text.annotations;
    let content: React.ReactNode = text.plain_text;

    // Determine the primary link for this text segment
    let linkHref: string | undefined = undefined;

    if (text.href) {
      linkHref = text.href; // Explicit link takes precedence
    } 
    if (text.type === 'mention' && text.mention?.type === 'page') {
      linkHref = `/posting/${text.mention.page?.id}`; // Page mention link
    }

    // Apply annotations first to the plain text
    if (annotations.bold) content = <strong>{content}</strong>;
    if (annotations.italic) content = <em>{content}</em>;
    if (annotations.strikethrough) content = <s>{content}</s>;
    if (annotations.underline) content = <u>{content}</u>;
    if (annotations.code) content = <code className="bg-gray-200 p-1 rounded text-sm">{content}</code>;
    if (annotations.color && annotations.color !== 'default') {
      content = <span className={`text-${annotations.color}-600`}>{content}</span>;
    }

    // Wrap with link if a linkHref was determined
    if (linkHref) {
      content = <Link href={linkHref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{content}</Link>;
    } else if (text.type === 'mention') { // Handle other mention types that are not links
        if (text.mention?.type === 'user') {
            content = <span className="font-semibold text-gray-700">@{text.mention.user?.person?.email || text.mention.user?.name}</span>;
        } else if (text.mention?.type === 'date') {
            content = <span className="text-gray-700">{new Date(text.mention.date?.start || '').toLocaleDateString()}</span>;
        }
    }

    return <span key={index}>{content}</span>;
  });
};

// Notion 블록을 렌더링하는 간단한 컴포넌트
export const renderBlock = (block: NotionBlock) => {
  switch (block.type) {
    case 'heading_1':
      return <h1 id={block.id} className="text-4xl font-bold my-4">
        {renderRichText(block.heading_1?.rich_text || [])}
      </h1>;
    case 'heading_2':
      return <h2 id={block.id} className="text-3xl font-bold my-3">
        {renderRichText(block.heading_2?.rich_text || [])}
      </h2>;
    case 'heading_3':
      return <h3 id={block.id} className="text-2xl font-bold my-3">
        {renderRichText(block.heading_3?.rich_text || [])}
      </h3>;
    case 'paragraph':
      return <p className="my-2 leading-relaxed">{renderRichText(block.paragraph?.rich_text || [])}</p>;
    case 'image':
      const imgSrc = block.image?.type === 'external' ? block.image.external?.url : block.image?.file?.url;
      const altText = block.image?.caption[0]?.plain_text || 'Notion Image';
      return (
        <div className="relative w-full h-96 my-4 rounded-lg shadow-md overflow-hidden">
          <Image
            src={imgSrc || ''}
            alt={altText}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
          />
        </div>
      );
    case 'code':
      return (
        <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto">
          <code className={`language-${block.code?.language}`}>
            {renderRichText(block.code?.rich_text || [])}
          </code>
        </pre>
      );
    case 'bulleted_list_item':
      return <li className="ml-6 list-disc">{renderRichText(block.bulleted_list_item?.rich_text || [])}</li>;
    case 'numbered_list_item':
      return <li className="ml-6 list-decimal">{renderRichText(block.numbered_list_item?.rich_text || [])}</li>;
    case 'table_of_contents':
      return <div className="my-4 p-4 bg-gray-50 rounded-md"><h2>Table of Contents</h2></div>; // 실제 목차는 동적으로 생성해야 함 -> render 부에서 구현
    case 'bookmark':
      const bookmark = block.bookmark;
      return (
        <Link href={bookmark?.url || ''} target="_blank" rel="noopener noreferrer" className="block my-4 p-4 border rounded-md hover:bg-gray-50">
          <h3 className="text-lg font-semibold">{renderRichText(bookmark?.caption || []) || bookmark?.url}</h3>
          {bookmark?.url && <p className="text-sm text-gray-600">{bookmark.url}</p>}
        </Link>
      );
    case 'column_list':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {block.children?.map((columnBlock: NotionBlock) => (
            <div key={columnBlock.id} className="flex flex-col">
              {columnBlock.children?.map((childBlock: NotionBlock) => (
                <div key={childBlock.id}>{renderBlock(childBlock)}</div>
              ))}
            </div>
          ))}
        </div>
      );
    case 'toggle':
      return (
        <details className="my-2 p-2 border rounded-md">
          <summary className="font-semibold cursor-pointer">
            {renderRichText(block.toggle?.rich_text || [])}
          </summary>
          <div className="ml-4 mt-2">
            {block.children?.map((childBlock: NotionBlock) => (
              <div key={childBlock.id}>{renderBlock(childBlock)}</div>
            ))}
          </div>
        </details>
      );
    default:
      return <p>Unsupported block type: {block.type}</p>;
  }
};