import * as React from "react"
import Image from 'next/image';


import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';


import { getPublishedPosts } from '@/lib/notion';
import { buildCategoryTree } from '@/lib/category-utils';
import { getAnalyticsData } from '@/lib/analytics'; // analytics 함수 임포트

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  // 1. 서버에서 글 목록 데이터를 가져옵니다.
  const posts = await getPublishedPosts();
  // 2. 데이터를 트리 구조로 변환합니다.
  const postCategoryTree = buildCategoryTree(posts);

  // 3. GA4 방문자 데이터를 가져옵니다.
  const analyticsData = await getAnalyticsData();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>

        <Card>
          <CardContent>
            <Image
              src="/images/ghibli.webp"
              alt="My profile picture"
              // width와 height를 직접 지정하여 크기를 조절할 수도 있습니다.
              width={200}
              height={200}
              // placeholder="blur" 옵션을 주면 로딩 중 흐릿한 이미지를 보여줍니다.
              placeholder="empty"
            />
          </CardContent>
          <CardHeader>
            <CardTitle>XIWOO BLOG</CardTitle>
            <CardDescription>
              {/* TODO: 나름의 슬로건 */}
            </CardDescription>
          </CardHeader>
        </Card>
        {/* TODO: Resume */}
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>

      <SidebarContent>
        <NavMain tree={postCategoryTree} />
        {/* TODO: 스터디(강의 정리한 내용) */}
        {/* TODO: 실제 진행하는 사이드 프로젝트 진행 내용 */}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {analyticsData && ( // analyticsData가 있을 때만 표시
          <div className="p-4 text-sm text-gray-600">
            <p>Today Views: {analyticsData.today}</p>
            <p>Realtime(30분) Views: {analyticsData.realtime}</p>
            <p>Yesterday Views: {analyticsData.yesterday}</p>
            <p>Total Views: {analyticsData.total}</p>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}