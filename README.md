# Notion Blog

이 프로젝트는 Next.js 15와 Notion API를 활용하여 구축된 개인 블로그입니다. Notion 데이터베이스를 콘텐츠 관리 시스템(CMS)으로 사용하여 블로그 게시물을 손쉽게 작성하고 TODO: (수정, 관리) 할 수 있습니다.

## 주요 기술 스택

*   **Next.js 15**: 최신 웹 애플리케이션 개발을 위한 React 프레임워크 (App Router 기반).
*   **React 19**: 사용자 인터페이스 구축을 위한 JavaScript 라이브러리.
*   **TypeScript**: 타입 안정성을 제공하여 코드의 신뢰성과 유지보수성을 향상.
*   **Notion API**: Notion 데이터베이스에서 블로그 콘텐츠를 가져오고 렌더링.
*   **Tailwind CSS**: 빠르고 효율적인 UI 개발을 위한 유틸리티 우선 CSS 프레임워크.
*   **shadcn/ui**: 재사용 가능한 UI 컴포넌트 라이브러리.

## 주요 기능

*   **Notion 기반 콘텐츠 관리**: Notion 데이터베이스를 통해 블로그 게시물 작성, TODO: 수정, 관리.
*   **동적 라우팅**: `[slug]` 기반의 동적 라우팅을 통해 각 게시물 페이지 생성.
*   **서버 컴포넌트 (SSR) 및 클라이언트 컴포넌트 (CSR) 혼합**:
*   **SEO 최적화**: `generateMetadata` 함수를 통해 각 게시물에 대한 동적 메타데이터(제목, 설명, 키워드) 생성.
*   **반응형 디자인**: Tailwind CSS를 활용하여 다양한 디바이스에서 최적화된 사용자 경험 제공.

## 프로젝트 구조 (src 디렉토리 기준)

*   `app/`: Next.js App Router의 페이지 및 레이아웃 파일.
    *   `posting/[slug]/`: 개별 블로그 게시물 페이지.
    *   `metion/[id]/`: 블로그 게시물에서 관리하진 않지만 연결되는 멘션된 페이지.
*   `components/`: 재사용 가능한 UI 컴포넌트 (예: `PostContent.tsx`, `notion-renderer.tsx`).
*   `hooks/`: 커스텀 React Hooks.
*   `lib/`: Notion API 통신 로직 및 유틸리티 함수 (예: `notion.ts`).
*   `types/`: TypeScript 타입 정의.

## 시작하기

1.  **환경 변수 설정**: `.env.local` 파일에 Notion API 관련 환경 변수를 설정합니다.
    *   `NOTION_TOKEN=YOUR_NOTION_INTEGRATION_TOKEN`
    *   `NOTION_DATABASE_ID=YOUR_NOTION_DATABASE_ID`
2.  **의존성 설치**: 
    ```bash
    npm install
    # 또는 yarn install
    ```
3.  **개발 서버 실행**: 
    ```bash
    npm run dev
    # 또는 yarn dev
    ```
    브라우저에서 `http://localhost:3000`으로 접속합니다.
4.  **빌드 및 배포**: 
    ```bash
    npm run build
    # 또는 yarn build
    npm run start
    # 또는 yarn start
    ```

## 기여

(기여 가이드라인 또는 연락처 정보 추가)

## 라이선스

(라이선스 정보 추가)