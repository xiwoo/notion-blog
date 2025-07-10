import { Client } from '@notionhq/client';
import { NotionBlogDatabasePage, NotionPage, NotionBlock, PostData, PostContentData } from '@/types/notion';
import { Post } from '@/types/post';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

export const getPublishedPosts = async (): Promise<Post[]> => {

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  const posts = (response.results as NotionBlogDatabasePage[]).map((post) => {
    // PageURL 속성에서 URL을 가져옵니다.
    const pageUrl = post.properties.PageURL.url || '';

    return {
     id: post.id,
     // URL에서 페이지 ID를 추출합니다.
     pageId: getPageIdFromUrl(pageUrl),
     title: post.properties.Title.title?.at(0)?.plain_text || '',
     slug: post.properties.Slug.rich_text?.at(0)?.plain_text || '',
     date: post.properties.Date.date?.start || '',
     tags: post.properties.Tags.multi_select?.map((tag: {name: string}) => tag.name) || [],
     category: post.properties.Category?.rich_text?.at(0)?.plain_text,
    };
  });

  return posts;
};

export const getPostBySlug = async (slug: string): Promise<PostData | null> => {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
          property: 'Slug',
          rich_text: {
              equals: slug,
          },
      },
  });

  if (response.results.length === 0) {
      return null;
  }
  const post: NotionBlogDatabasePage = response.results[0] as NotionBlogDatabasePage;
  // PageURL 속성에서 URL을 가져옵니다.
  const pageUrl = post.properties.PageURL.url || '';
   
  return {
     post: post,
     // URL에서 페이지 ID를 추출합니다.
     pageId: getPageIdFromUrl(pageUrl),
  };
}

export const getPostContent = async (pageId: string): Promise<PostContentData> => {
  // const start = performance.now(); // 측정 시작
  // try {
    const page = await notion.pages.retrieve({ page_id: pageId }) as NotionPage;
    const content = await retrieveBlockChildren(pageId);

    return {
      page: page,
      content: content,
    };
  // } finally {
  //   const end = performance.now(); // 측정 종료
  //   console.log(`getPostContent-${pageId} took ${end - start} ms`); // 결과 출력
  // }
};

/**
* Notion URL에서 페이지 ID를 추출하는 헬퍼 함수
* 예: https://www.notion.so/My-Post-Title-f8329a8349a84a87b35a824a5f8a6b79
* -> f8329a8349a84a87b35a824a5f8a6b79
*/
const getPageIdFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);

    const pathname = urlObj.pathname;

    const pathSegments = pathname.split('/');
    const lastPathSegment = pathSegments[pathSegments.length - 1];

    const urlParts = lastPathSegment.split('-');
    return urlParts[urlParts.length - 1];
  }
  catch(e) {
    console.error("Error parsing Notion URL for page ID:", url, e);
    return '';
  }
};

const retrieveBlockChildren = async (blockId: string): Promise<NotionBlock[]> => {
  let allBlocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100, // Notion API max page size
    });

    allBlocks = allBlocks.concat(response.results as NotionBlock[]);
    cursor = response.next_cursor || undefined;

    // Recursively fetch children for blocks that can have them
    // e.g., column_list, column, toggle
    const blocksWithChildren = await Promise.all(
      (response.results as NotionBlock[]).map(async (block) => {
        if (block.has_children) {
          block.children = await retrieveBlockChildren(block.id);
        }
        return block;
      })
    );
    // Replace original blocks with blocks that have children
    allBlocks = allBlocks.map(block => blocksWithChildren.find(b => b.id === block.id) || block);

  } while (cursor);

  return allBlocks;
}