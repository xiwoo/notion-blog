// "use client"

import * as React from "react"
import Image from 'next/image';
import profileImage from '../public/images/ghibli.webp';

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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


export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {


  
  // 1. 서버에서 글 목록 데이터를 가져옵니다.
  const posts = await getPublishedPosts();
  // 2. 데이터를 트리 구조로 변환합니다.
  const postCategoryTree = buildCategoryTree(posts);


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>

        <Card>
          <CardContent>
            <Image
              src={profileImage}
              alt="My profile picture"
              // width와 height를 직접 지정하여 크기를 조절할 수도 있습니다.
              // width={200}
              // height={200}
              // placeholder="blur" 옵션을 주면 로딩 중 흐릿한 이미지를 보여줍니다.
              placeholder="blur"
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
        {/* TODO: 방문자 기록, total, today, yesterday */}
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
