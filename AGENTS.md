# Jirum-Alarm-Frontend Monorepo

**Korean Hot Deal Aggregation Service** - 모든 핫딜을 한번에

A comprehensive monorepo for the Jirum-Alarm service, which aggregates hot deals from various Korean communities. Built with Next.js, TypeScript, and modern web technologies.

## 🏗️ Monorepo Overview

This is a **Turborepo monorepo** that manages multiple applications and shared packages for the Jirum-Alarm platform. The service aggregates hot deals from various Korean communities and provides them through web and mobile applications.

### Key Features
- **Multi-app Architecture**: Separate apps for web, admin, and landing pages
- **Shared UI Components**: Reusable component library
- **Hot Deal Aggregation**: Real-time deal collection from various Korean communities
- **Category-based Organization**: Deals organized by categories
- **Custom Notifications**: Alert system for desired products
- **Analytics Dashboard**: Admin panel for monitoring and management

## 📁 Repository Structure

```
jirum-alarm-frontend/
├── apps/                    # Next.js applications
│   ├── web/                # Main web application (port 3000)
│   ├── admin/              # Admin dashboard (port 3000, 운영 도구)
│   └── landing/            # Landing page (port 3100)
├── packages/               # Shared packages
│   ├── eslint/            # ESLint configuration
│   ├── prettier/          # Prettier configuration  
│   ├── typescript/        # TypeScript configuration
│   └── ui/                # Shared UI components (via workspace links)
├── configs/               # Build and deployment configs
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # PNPM workspace configuration
└── package.json          # Root package configuration
```

## ⚙️ Key Configuration Files

### Root Configuration
- **`package.json`**: Root package with Turborepo scripts and dependencies
- **`turbo.json`**: Turborepo task orchestration and caching
- **`pnpm-workspace.yaml`**: PNPM workspace configuration
- **`knip.json`**: Knip configuration for unused code detection

### Development Environment
- **Node.js**: `>=v20.x.x` required
- **Package Manager**: `pnpm@10.15.0+`
- **TypeScript**: `^5.8.3`
- **Turbo**: `^2.0.1` for monorepo orchestration

## 🚀 Applications

### 1. **Web App** (`apps/web/`)
**Main Application - Hot Deal Aggregation Platform**

**Technology Stack:**
- **Framework**: Next.js 15.4.10 with App Router
- **UI**: React 19.1.2, Tailwind CSS 4.1.11
- **State Management**: Jotai, React Query (TanStack Query)
- **Data Fetching**: Apollo Client (GraphQL)
- **Styling**: Tailwind CSS, Tailwind Merge, Class Variance Authority
- **Animation**: Motion, Swiper, Tailwind CSS Animate
- **Analytics**: Sentry, Mixpanel, PostHog
- **Real-time**: GraphQL WS, Firebase
- **Development**: Storybook, MSW for mocking

**Key Features:**
- Hot deal aggregation from multiple Korean communities
- Category-based browsing and filtering
- Real-time notifications and alerts
- Mobile-responsive design
- PWA capabilities
- Comprehensive analytics integration

**Development Scripts:**
```bash
pnpm dev              # Development server
pnpm dev:mock         # Development with MSW mocking
pnpm build           # Production build
pnpm storybook       # Storybook development
pnpm code-gen        # GraphQL code generation
```

### 2. **Admin App** (`apps/admin/`)
**Administrative Dashboard** — 매칭 검수·핫딜 키워드·키워드맵·광고·알림·통계·수익링크 운영 도구

**Technology Stack:**
- **Framework**: Next.js 15.5 (App Router), React 19.2
- **UI**: Tailwind CSS 3.4 (TailAdmin 토큰: `primary`·`success`·`danger`·`stroke`·`boxdark`…). 라이트 전용 — `dark:` 클래스는 남아 있지만 토글이 없다
- **Data Fetching**: Apollo Client 3 (GraphQL, 운영 API `jirum-api.kyojs.com/graphql`)
- **Charts**: ApexCharts · **Virtualization**: TanStack React Virtual · **Date**: Day.js

**Structure:**
```
src/app/
├── (admin)/            # 로그인 뒤 화면 전부 — layout.tsx 가 DefaultLayout(사이드바·헤더·에러 배너)을 한 번 그린다
│   └── <route>/        # page.tsx 는 얇게, 로직은 같은 폴더 components/ (필요시 hooks/ lib/)
├── auth/signin/        # 레이아웃 밖
├── actions/token.ts    # httpOnly accessToken 쿠키(서버 액션)
└── error.tsx           # 렌더 중 에러 경계
src/graphql/*.ts        # gql 문서(오퍼레이션) 전부 여기
src/hooks/graphql/*.ts  # 오퍼레이션별 훅 — 타입은 src/generated/gql 생성 타입(손타입 금지)
src/components/         # 공통: Layouts·Sidebar(메뉴는 MENU 설정 배열)·QueryErrorBanner·…
```

**Conventions / 함정:**
- 새 오퍼레이션: `src/graphql/`에 문서 → `pnpm --filter admin code-gen`(운영 스키마 기준) → 훅에서 생성 타입 사용.
  dev API 는 스키마가 뒤처져 codegen 소스로 쓰지 않는다.
- GraphQL 실패는 Apollo 에러 링크가 상단 `QueryErrorBanner` 로 띄운다 — 화면이 `error` 를 안 읽어도 "결과 없음"으로 위장되지 않게.
  인증 에러(FORBIDDEN/UNAUTHENTICATED)만 로그인으로 보낸다.
- searchAfter 커서 무한 스크롤은 `useLoadMoreOnView`.
- 공통 UI: 알림은 `useToast()`(alert 금지), 확인은 `await useConfirm()(...)`(confirm 금지), 로딩은 `<Spinner>`, 흰 카드 틀은 `<Panel>`.
  토스트·확인 provider 는 DefaultLayout 에 한 번 달려 있다(로그인 화면은 레이아웃 밖이라 별도).
- Apollo 클라이언트는 서버 렌더에도 만들어지지만 서버엔 토큰을 싣지 않는다(httpOnly 토큰이 HTML 에 실리지 않게) —
  서버에서 인증 쿼리가 필요한 useSuspenseQuery 화면은 브라우저가 다시 받는다.
- 큰 화면(매칭 검수 `VerificationGroupByView/`, 광고 `GraphicLayerEditor/`)은 폴더 안 훅·컴포넌트로 나뉘어 있다. `layout.ts` 같은
  Next 예약 파일명은 라우트 폴더 밑에 두지 말 것(빌드가 라우트 레이아웃으로 읽는다).
- 미들웨어는 쿠키 "존재"만 본다 — 서버 액션처럼 백엔드를 안 거치는 쓰기를 만들면 액션 안에서 `adminMe` 로 어드민인지 직접 확인할 것.
- 사이드바 메뉴 추가 = `src/components/Sidebar/index.tsx` 의 `MENU` 배열에 한 줄.
- `public/` 은 비어 있어도 지우지 말 것(`.gitkeep`) — Dockerfile 이 COPY 한다.

**Development Scripts:**
```bash
pnpm --filter admin dev        # :3000 (운영 API 에 붙는다 — 쓰기 조작 주의)
pnpm --filter admin build
pnpm --filter admin code-gen   # 운영 스키마로 타입 생성
```

**Deploy:** main push → 스테이징. 운영은 `v*.*.*` 태그(web·ai 도 함께 나감) 또는 admin 만: `gh workflow run deploy-admin-prod.yml --ref main`.

### 3. **Landing App** (`apps/landing/`)
**Marketing Landing Page**

**Technology Stack:**
- **Framework**: Next.js 15.4.10
- **UI**: React 19.1.2, Tailwind CSS 4.1.7
- **Styling**: Motion for animations, Tailwind Merge

**Key Features:**
- Marketing and promotional content
- Feature showcases
- App download links and integration
- SEO-optimized structure

**Development Scripts:**
```bash
pnpm dev --port 3100  # Development server on port 3100
pnpm build            # Production build
```

## 📦 Shared Packages

### 1. **ESLint Config** (`packages/eslint/`)
**`@jirum/eslint-config-jirum`**

Comprehensive ESLint configuration for all applications:
- Next.js plugin support
- TypeScript integration
- React and React Hooks rules
- Prettier compatibility
- Storybook linting
- Import/export rules
- Turbo config support

### 2. **TypeScript Config** (`packages/typescript/`)
**`@jirum/tsconfig`**

Shared TypeScript configuration:
- Base TypeScript settings
- Path mapping configurations
- Compiler options optimized for Next.js
- Public access configuration

### 3. **Prettier Config** (`packages/prettier/`)
**`@jirum/prettier`**

Code formatting standards:
- Consistent code style across all packages
- Tailwind CSS class sorting
- JSON and markdown formatting

### 4. **UI Components** (`packages/ui/`)
**Shared Component Library**

Reusable UI components accessed via workspace links:
- Design system components
- Form elements and inputs
- Layout components
- Theme and styling utilities
- Icons and visual assets

## 🛠️ Development Guidelines for AI Agents

### Code Quality Standards
1. **TypeScript**: All code must be fully typed
2. **ESLint**: Follow `@jirum/eslint-config-jirum` rules
3. **Prettier**: Use `@jirum/prettier` for consistent formatting
4. **Components**: Use shared components from `packages/ui` when possible

### Architecture Principles
1. **Monorepo Awareness**: Changes may affect multiple applications
2. **Shared Dependencies**: Leverage workspace packages for common functionality
3. **GraphQL**: Use Apollo Client with proper type generation
4. **State Management**: Use Jotai for client state, React Query for server state

### Development Workflow
1. **Install Dependencies**: Always use `pnpm install` at root level
2. **Development**: Use `pnpm dev` for parallel development of all apps
3. **Type Checking**: Run `pnpm check-types` to verify all packages
4. **Linting**: Use `pnpm lint` for code quality checks
5. **Building**: Use `pnpm build` for production builds

### Testing and Quality Assurance
1. **Storybook**: Components should have Storybook stories
2. **MSW**: Use Mock Service Worker for API mocking in development
3. **GraphQL**: Run `pnpm code-gen` after schema changes
4. **Knip**: Use Knip to detect unused code and dependencies

### File Organization
- **Apps**: Feature-specific code in respective `apps/` directories
- **Packages**: Shared functionality in `packages/` directory
- **Configuration**: All config files use workspace references
- **Types**: Shared types should be in appropriate packages or apps

## 🔧 Technology Stack

### Core Technologies
- **Framework**: Next.js 15.4.10 (App Router)
- **Language**: TypeScript 5.8.3
- **Package Manager**: PNPM 10.15.0
- **Monorepo**: Turborepo 2.0.1
- **UI Library**: React 19.1.2

### Styling & UI
- **CSS Framework**: Tailwind CSS 4.x
- **Component Library**: Custom Radix UI-based components
- **Animation**: Motion, Swiper, Tailwind Animate
- **Styling Utils**: Tailwind Merge, Class Variance Authority, CLSX

### Data & State Management
- **GraphQL**: Apollo Client 3.x
- **State Management**: Jotai 2.x
- **Server State**: TanStack React Query 5.x
- **Real-time**: GraphQL WS, Firebase 10.x

### Development & Tooling
- **Code Quality**: ESLint 9.x, Prettier 3.x, Husky, Lint-staged
- **Testing**: Storybook 8.x, MSW 2.x for mocking
- **Build Tools**: Next.js Bundle Analyzer, Sharp for image optimization
- **Type Generation**: GraphQL Code Generator

### Analytics & Monitoring
- **Error Tracking**: Sentry 10.x
- **Analytics**: Mixpanel, PostHog
- **Performance**: Web performance monitoring
- **Deployment**: Platform-agnostic deployment configuration

### External Integrations
- **Authentication**: JWT-based auth system
- **File Upload**: Express-based middleware
- **Notifications**: Firebase Cloud Messaging
- **Search**: Custom search implementation

## 🚀 Getting Started

### Prerequisites
- Node.js >= v20.x.x
- PNPM package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd jirum-alarm-frontend

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Development Commands
```bash
# Development (all apps)
pnpm dev

# Individual app development
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter landing dev

# Type checking
pnpm check-types

# Linting
pnpm lint

# Building
pnpm build

# Storybook (web app)
pnpm --filter web storybook
```

### Environment Setup
Each app may require specific environment variables:
- Copy `.env.example` to `.env.local` in app directories
- Configure API endpoints and service credentials
- Enable/disable MSW mocking as needed

## 📝 Notes

### Performance Considerations
- Use Turborepo caching for efficient builds
- Leverage Next.js Image optimization with Sharp
- Implement proper code splitting and lazy loading
- Use React Query for efficient data fetching

### Security
- All apps use JWT-based authentication
- GraphQL schemas are typed and validated
- Environment variables are properly managed
- Content Security Policy headers implemented

### Deployment
- Deployment configuration managed per platform/environment
- Docker support for admin application
- Separate environments for development and production
- Automated CI/CD through repository-integrated workflows

---

**AI Agent Guidelines**: Always work within the monorepo structure, respect shared dependencies, and maintain consistency across all applications. Use workspace references for shared packages and follow the established patterns for each application type.