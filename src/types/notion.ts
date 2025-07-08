// src/types/notion.ts

export interface RichTextItem {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  type: 'text' | 'mention' | 'equation';
  mention?: {
    type: 'page' | 'user' | 'date';
    page?: { id: string };
    user?: { id: string; name?: string; person?: { email: string } };
    date?: { start: string; end: string | null };
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  children?: NotionBlock[]; // For column_list, toggle, etc.
  // Common rich_text properties
  paragraph?: { rich_text: RichTextItem[] };
  heading_1?: { rich_text: RichTextItem[] };
  heading_2?: { rich_text: RichTextItem[] };
  heading_3?: { rich_text: RichTextItem[] };
  code?: { rich_text: RichTextItem[]; language: string };
  bulleted_list_item?: { rich_text: RichTextItem[] };
  numbered_list_item?: { rich_text: RichTextItem[] };
  toggle?: { rich_text: RichTextItem[] };
  // Specific block properties
  image?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
    caption: RichTextItem[];
  };
  bookmark?: {
    url: string;
    caption: RichTextItem[];
  };
  table_of_contents?: {
    color: string;
  };
  // Add other block types as needed
}

export interface NotionPageProperty {
  id: string;
  type: string;
  title?: RichTextItem[];
  rich_text?: RichTextItem[];
  url?: string;
  date?: { start: string; end: string | null };
  multi_select?: { id: string; name: string; color: string }[];
  checkbox?: boolean;
  // Add other property types as needed
}


export interface NotionBlogDatabaseProperties {
  properties: {
    Title: NotionPageProperty;
    Slug: NotionPageProperty;
    Date: NotionPageProperty;
    Tags: NotionPageProperty;
    Published: NotionPageProperty;
    PageURL: NotionPageProperty;
    Description?: NotionPageProperty;
    Category?: NotionPageProperty;
    // Add other properties as needed
  };
}

export interface NotionPageProperties {
  properties: {
    title: NotionPageProperty;
    // Add other properties as needed
  };
}

export interface NotionBlogDatabasePage extends NotionBlogDatabaseProperties {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  url: string;
}

export interface NotionPage extends NotionPageProperties {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  url: string;
}

export interface PostData {
  post: NotionBlogDatabasePage;
  pageId: string;
}

export interface PostContentData {
  page: NotionPage;
  content: NotionBlock[];
}
