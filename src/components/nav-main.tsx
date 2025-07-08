"use client"

import Link from 'next/link';
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { DynamicIcon, type IconName } from './DynamicIcon';

import { TreeNode, PostNode } from '@/types/category';


const navigationIconMap: {[ key: string ]: IconName } = {
  Programming: "SquareTerminal",
  Development: "Bot",
}

interface NavMainProps {
  tree: TreeNode;
}

const Tree = ({ name, node } : {name: string, node: TreeNode | PostNode}) => {

  if (node.type === 'post') {
    return (
      <SidebarMenuSubItem key={name}>
        <SidebarMenuSubButton asChild  className="data-[active=true]:bg-transparent">
          <Link href={`/posting/${node.slug}`} key={node.id} className="block py-1 text-sm hover:bg-muted rounded-md">
            {node.title}
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  if (node.type === 'category') {
    return (
      <Collapsible
        key={name}
        asChild
        // defaultOpen={item.isActive}
        className="group/collapsible [&[data-state=open]>button>svg:last-child]:rotate-90"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={name}>
              { navigationIconMap[name] && <DynamicIcon name={navigationIconMap[name]} /> }
              <span>{name}</span>
              <ChevronRight  className="ml-auto transition-transform" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className='mr-0 pr-0'>
              {Object.entries(node.children).map(([childName, childNode], idx) =>
                <Tree key={idx} name={childName} node={childNode as TreeNode | PostNode} />
              )}
            </SidebarMenuSub>
          </CollapsibleContent>

        </SidebarMenuItem>
      </Collapsible>
    );
  }
};


export function NavMain({
  tree,
}: NavMainProps) {

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Link href={`/posting`} className="block py-1 text-sm hover:bg-muted rounded-md">
          POSTING
        </Link>
      </SidebarGroupLabel>
      <SidebarMenu>

        {Object.entries(tree.children).map(([name, node], idx) =>
          <Tree key={idx} name={name} node={node as TreeNode | PostNode} />
        )}

      </SidebarMenu>
    </SidebarGroup>
  )
}
