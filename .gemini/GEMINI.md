# 프로젝트 개요: Next.js Notion 블로그

이 문서는 Next.js App Router 기반의 Notion 블로그 프로젝트의 핵심 구조와 주요 기술 스택을 빠르게 파악하기 위한 가이드입니다.

---

## 1. 프로젝트 기본 정보

*   **프로젝트명**: Notion Blog
*   **주요 목적**: Notion 데이터베이스를 CMS(콘텐츠 관리 시스템)로 활용하는 개인 블로그

---

## 2. 핵심 기술 스택

*   **프레임워크**: Next.js 15 (App Router)
*   **UI 라이브러리**: React 19
*   **언어**: TypeScript
*   **CMS 연동**: Notion API (`@notionhq/client`)
*   **스타일링**: Tailwind CSS
*   **UI 컴포넌트**: shadcn/ui
*   **분석**: Google Analytics 4 (GA4) Data API (`@google-analytics/data`)

---

## 3. 주요 아키텍처 및 특징

### 3.1. Notion 연동 및 데이터 흐름

*   **Notion API Key**: `process.env.NOTION_API_KEY`
*   **Notion Database ID**: `process.env.NOTION_DATABASE_ID`
*   **주요 Notion 연동 파일**: `src/lib/notion.ts`
    *   `getPublishedPosts()`: 발행된 모든 게시물 목록 조회 (SSG `generateStaticParams`에서 사용)
    *   `getPostBySlug(slug)`: 특정 slug에 해당하는 게시물 메타데이터 조회
    *   `getPostContent(pageId)`: Notion 페이지의 블록(콘텐츠) 조회
    *   `getPageIdFromUrl(url)`: Notion URL에서 쿼리 파라미터를 제거하고 페이지 ID 추출

### 3.2. 렌더링 전략 (SSR, SSG, CSR)

*   **게시물 목록 (`src/app/page.tsx`)**: SSR (Server-Side Rendering)
*   **개별 게시물 페이지 (`src/app/posting/[slug]/page.tsx`)**:
    *   **SSG (Static Site Generation)**: `generateStaticParams`를 통해 빌드 시점에 모든 게시물 페이지를 미리 생성.
    *   **ISR (Incremental Static Regeneration)**: `revalidate = 3600` (1시간) 설정으로 주기적인 백그라운드 재생성.
    *   **SSR (메타데이터)**: 게시물 제목, 날짜 등 메타데이터는 SSR로 빠르게 제공.
    *   **CSR (본문 콘텐츠)**: 게시물 본문(`PostContent`)은 클라이언트 컴포넌트로 분리되어 CSR로 렌더링. `React.Suspense`를 통해 로딩 상태 관리.
        *   `src/app/posting/[slug]/_components/PostContent.tsx` (클라이언트 컴포넌트)
        *   `src/app/posting/[slug]/_components/DynamicPostContentWrapper.tsx` (클라이언트 컴포넌트, `ssr: false` 처리용 래퍼)

### 3.3. GA4 통합 및 방문자 통계

*   **기본 추적**: `src/app/layout.tsx`에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`를 사용하여 `gtag.js` 스크립트 삽입.
*   **방문자 통계 조회**: `src/lib/analytics.ts`
    *   Google Analytics Data API 사용.
    *   인증: Google Cloud 서비스 계정 키(`GOOGLE_APPLICATION_CREDENTIALS_JSON`) 사용.
    *   GA4 속성 ID: `GA4_PROPERTY_ID` (숫자 ID) 사용.
    *   `getAnalyticsData()` 함수를 통해 `total`, `today`, `yesterday` 페이지 뷰 데이터 조회.
        *   `total`, `yesterday`: `runReport` (처리 지연 있음)
        *   `today`: `runRealtimeReport` (최근 30분 활동, 실시간에 가까움)
    *   표시 위치: `src/components/app-sidebar.tsx`의 `SidebarFooter` 부분.

### 3.4. Notion 콘텐츠 렌더러 (`src/components/notion-renderer.tsx`)

*   Notion 블록 타입을 React 컴포넌트로 변환하여 렌더링.
*   **주요 개선 사항**:
    *   중첩된 리스트(`bulleted_list_item`, `numbered_list_item`) 렌더링 지원.
    *   `renderBlock` 함수에 `depth` 파라미터 추가하여 중첩 레벨에 따른 들여쓰기(`ml-{value}`) 구현.
    *   `<li>` 태그 내부에 `flex` 컨테이너를 사용하여 글머리 기호(`::marker`)와 텍스트의 자연스러운 정렬 및 `::marker` 유지.
    *   커스텀 불릿 스타일 적용 가능.

---

## 4. 주요 파일 및 디렉토리 구조

*   `src/app/`: Next.js App Router의 페이지 및 레이아웃.
    *   `src/app/layout.tsx`: 전역 레이아웃, GA4 기본 추적 스크립트.
    *   `src/app/page.tsx`: 블로그 메인 페이지 (최신 게시물 목록).
    *   `src/app/posting/[slug]/page.tsx`: 개별 게시물 페이지 (SSG/ISR, SSR/CSR 혼합).
    *   `src/app/posting/[slug]/_components/`: 개별 게시물 페이지 관련 클라이언트 컴포넌트.
*   `src/components/`: 재사용 가능한 UI 컴포넌트.
    *   `src/components/app-sidebar.tsx`: 블로그 사이드바, GA4 방문자 통계 표시.
    *   `src/components/notion-renderer.tsx`: Notion 블록 렌더링 로직.
*   `src/lib/`: 유틸리티 함수 및 외부 API 연동 로직.
    *   `src/lib/notion.ts`: Notion API 연동 (게시물 조회, 콘텐츠 조회 등).
    *   `src/lib/analytics.ts`: GA4 Data API 연동 (방문자 통계 조회).
*   `src/types/`: TypeScript 타입 정의.
*   `.env.local`: 환경 변수 설정 (Notion API Key, Database ID, GA4 Measurement ID, GA4 Property ID, Google Credentials JSON).

---

## 5. 개발 및 배포 참고 사항

*   **환경 변수**: `.env.local` 파일에 필요한 환경 변수 설정 필수.
*   **의존성 설치**: `npm install` 또는 `yarn install`.
*   **개발 서버**: `npm run dev` 또는 `yarn dev`.
*   **빌드**: `npm run build` (SSG/ISR 페이지 생성).
*   **Git**: Conventional Commits 규약 준수 권장.

---

## 6. 추가 논의 필요 사항

*   **`today` 지표의 실시간성**: `src/lib/analytics.ts`의 `today` 지표를 "최근 30분 활동"으로 할지, 아니면 "오늘 하루 전체(처리 지연 포함)"로 할지 최종 결정 필요.