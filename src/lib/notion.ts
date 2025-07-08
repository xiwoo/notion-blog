import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

/**
* Notion URL에서 페이지 ID를 추출하는 헬퍼 함수
* 예: https://www.notion.so/My-Post-Title-f8329a8349a84a87b35a824a5f8a6b79
* -> f8329a8349a84a87b35a824a5f8a6b79
*/
const getPageIdFromUrl = (url: string): string => {
  const urlParts = url.split('-');
  return urlParts[urlParts.length - 1];
};


export const getPublishedPosts = async () => {

  // console.log(databaseId);
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


  const posts = response.results.map((post: any) => {

    // PageURL 속성에서 URL을 가져옵니다.
    const pageUrl = post.properties.PageURL.url;

    return {
     id: post.id,
     // URL에서 페이지 ID를 추출합니다.
     pageId: getPageIdFromUrl(pageUrl),
     title: post.properties.Title.title[0].plain_text,
     slug: post.properties.Slug.rich_text[0].plain_text,
     date: post.properties.Date.date.start,
     tags: post.properties.Tags.multi_select.map((tag: any) => tag.name),
     category: post.properties.Category?.rich_text[0]?.plain_text || null,
    };
  });


  return posts;
};

export const getPostBySlug = async (slug: string) => {
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
  const post: any = response.results[0];
  // PageURL 속성에서 URL을 가져옵니다.
  const pageUrl = post.properties.PageURL.url;
   
  return {
     post: post,
     // URL에서 페이지 ID를 추출합니다.
     pageId: getPageIdFromUrl(pageUrl),
  };
}

async function retrieveBlockChildren(blockId: string) {
  let allBlocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100, // Notion API max page size
    });

    allBlocks = allBlocks.concat(response.results);
    cursor = response.next_cursor || undefined;

    // Recursively fetch children for blocks that can have them
    // e.g., column_list, column, toggle
    const blocksWithChildren = await Promise.all(
      response.results.map(async (block: any) => {
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

export const getPostContent = async (pageId: string) => {

  const page = await notion.pages.retrieve({ page_id: pageId });
  const content = await retrieveBlockChildren(pageId);

  return {
    page: page,
    content: content,
  };
};