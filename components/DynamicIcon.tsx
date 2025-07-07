// components/DynamicIcon.tsx
import React from 'react';
import * as icons from 'lucide-react';
import { type LucideProps } from 'lucide-react';

type NonIconExports =
 | 'createLucideIcon'
 | 'icons'
 | 'default'
 | 'LucideIcon'
 | 'IconNode'
 | 'toKebabCase'
 | 'createElement';

// 'icons' 객체의 키 타입을 정의하여 타입 안정성을 높입니다.
// 이렇게 하면 'name' prop으로 유효한 아이콘 이름만 받도록 강제할 수 있습니다.
export type IconName = Exclude<keyof typeof icons, NonIconExports>;

interface DynamicIconProps extends LucideProps {
  name: IconName;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // icons 객체에서 'name' prop에 해당하는 아이콘 컴포넌트를 찾습니다.
  const LucideIcon = icons[name] as React.ElementType;

  // 만약 해당하는 아이콘이 없다면 아무것도 렌더링하지 않습니다.
  // 또는 기본 아이콘(fallback)을 보여줄 수도 있습니다. e.g., return <icons.HelpCircle {...props}/>;
  if (!LucideIcon) {
    return null;
  }

  // 찾은 아이콘 컴포넌트를 렌더링하고, 나머지 props(size, className 등)를 전달합니다.
  return <LucideIcon {...props} />;
};

// 유효한 아이콘 이름 목록을 내보내서 다른 곳에서 활용할 수도 있습니다.
export const availableIconNames = Object.keys(icons).filter(
  (key) => !key.match(/^[A-Z]/)
) as IconName[];