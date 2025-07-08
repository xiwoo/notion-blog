
import { getPublishedPosts } from '@/lib/notion';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types/post';

// ISR을 위한 설정 (예: 1시간마다 재생성)
export const revalidate = 3600;

export default async function PostingPage() {
  const posts: Post[] = await getPublishedPosts();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Posting</h1>
      <div className="grid gap-6">
        {posts.map((post: Post) => (
          <Link href={`/posting/${post.slug}`} key={post.id}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}