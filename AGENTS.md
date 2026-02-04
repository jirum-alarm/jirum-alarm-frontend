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
│   ├── admin/              # Admin dashboard (port 3000)
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
- **`vercel.json`**: Vercel deployment configuration

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
**Administrative Dashboard**

**Technology Stack:**
- **Framework**: Next.js 15.4.10
- **UI**: React 19.1.2, Tailwind CSS 3.4.1
- **Data Fetching**: Apollo Client (GraphQL)
- **Charts**: ApexCharts, React ApexCharts
- **Virtualization**: TanStack React Virtual
- **Date Handling**: Day.js, Flatpickr

**Key Features:**
- Analytics and monitoring dashboard
- Deal management and curation
- User management and statistics
- Real-time data visualization
- Docker support for development and production

**Development Scripts:**
```bash
pnpm dev              # Development server
pnpm build           # Production build
make build-development && make start-development  # Docker dev
make build-production && make start-production   # Docker prod
```

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
- **Performance**: Vercel Speed Insights
- **Deployment**: Vercel (with custom configuration)

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
- Vercel deployment with custom configuration
- Docker support for admin application
- Separate environments for development and production
- Automated CI/CD through Vercel integration

---

**AI Agent Guidelines**: Always work within the monorepo structure, respect shared dependencies, and maintain consistency across all applications. Use workspace references for shared packages and follow the established patterns for each application type.