<!-- Parent: ../AGENTS.md -->
# Landing App - Jirum-Alarm Marketing Landing Page

**Marketing Interface** - Promotional landing page for the Jirum-Alarm mobile applications

## 🎯 App Purpose and Role

The Landing app serves as the primary marketing and promotional interface for the Jirum-Alarm platform, providing:

- **Product Showcase**: Feature highlights and service demonstrations
- **App Download Promotion**: Direct links to iOS and Android app stores
- **Brand Presentation**: Company information and value proposition
- **User Acquisition**: Conversion-focused marketing content

This app is designed as a static marketing website to attract new users and provide information about the Jirum-Alarm hot deal aggregation service.

## 📁 Key Files and Configuration

### Core Configuration
- **`package.json`**: Dependencies and scripts for the landing page
- **`next.config.ts`**: Next.js configuration with static export and SEO optimization
- **`tsconfig.json`**: TypeScript configuration extending workspace settings
- **`eslint.config.mjs`**: ESLint configuration using workspace preset
- **`prettier.config.mjs`**: Code formatting configuration

### Build and Deployment
- **`wrangler.toml`**: Cloudflare Workers configuration for static hosting
- **`postcss.config.mjs`**: PostCSS configuration for Tailwind CSS processing
- **`next-env.d.ts`**: Next.js TypeScript type definitions

### Development
- **`.gitignore`**: Git ignore configuration for Node.js and Next.js
- **`README.md`**: Basic Next.js project documentation

## 🏗️ Source Code Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── components/              # Page-specific components
│   │   ├── header/              # Navigation header components
│   │   │   ├── Header.tsx       # Main navigation header
│   │   │   ├── Navigation.tsx  # Navigation menu
│   │   │   ├── NavLink.tsx      # Navigation link component
│   │   │   └── Title.tsx        # Site title component
│   │   ├── key-visual/          # Hero section components
│   │   │   ├── KeyVisual.tsx    # 히어로 — 칩·약속(진짜 싼지)·설명·설치·숫자 3개
│   │   │   ├── HeroPhone.tsx    # 잠금화면 알림 두 개(키워드 알림 → ✅ 근거 확인)를 그린 폰
│   │   │   └── AppDownload.tsx  # App download CTAs (QR·스토어, 자리별 utm_content)
│   │   ├── concepts/
│   │   │   └── Concepts.tsx     # 하는 일 세 가지(모으고·따지고·알려요) 카드
│   │   ├── intro-video/
│   │   │   └── IntroVideo.tsx   # 33초 소개 영상(세로·가로)
│   │   ├── talkroom/           # Talk room section
│   │   │   └── TalkRoom.tsx     # Community discussion section
│   │   ├── faq/
│   │   │   └── Faq.tsx          # 자주 묻는 질문(<details>) — 전체는 web /help
│   │   ├── footer/             # Footer components
│   │   │   ├── Footer.tsx       # Main footer
│   │   │   └── Banner.tsx       # 마지막 설치 권유(라임 띠)
│   │   ├── icons.tsx           # 선 아이콘(currentColor)
│   │   └── SectionHeader.tsx   # 구역 제목(알약·제목·설명)
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Landing page home
│   ├── icon.png                # App icon
│   ├── opengraph-image.png     # Social media preview image
│   └── favicon.ico             # Site favicon
├── shared/                      # Shared utilities and constants
│   ├── constants/
│   │   └── page.ts             # Page configuration constants
│   └── libs/
│       └── cn.ts               # Utility function for class names
├── hooks/                       # Custom React hooks
│   └── useDevice.ts           # Device detection utilities
├── styles/                      # Global styles
│   └── globals.css            # Global CSS styles
└── fonts/                       # Font assets
    ├── PretendardVariable.woff2 # Korean font family
    └── font.ts                # Font configuration
```

## ⚙️ Technology Stack

### Core Framework
- **Next.js 15.4.10**: React framework with App Router and static export
- **React 19.1.2**: UI library with latest features
- **TypeScript 5.8.3**: Type-safe JavaScript development

### UI and Styling
- **Tailwind CSS 4.1.7**: Utility-first CSS framework with latest features
- **PostCSS**: CSS processing and optimization
- **Tailwind Merge 2.6.0**: Utility for merging Tailwind CSS classes
- **CLSX 2.1.1**: Utility for constructing className strings

### Animation and Interactions
- **Motion 12.6.3**: Animation library for smooth transitions
- **React Intersection Observer**: Viewport detection for scroll animations

### Development Tools
- **ESLint**: Code quality and linting with workspace configuration
- **Prettier**: Code formatting with Tailwind CSS plugin
- **TypeScript**: Static type checking
- **Husky**: Git hooks for pre-commit validation
- **Lint-staged**: Linting for staged files

### Build and Deployment
- **Static Export**: Configured for static site generation
- **Cloudflare Workers**: Optimized for edge deployment
- **Image Optimization**: Unoptimized images for static hosting
- **SEO Optimization**: Proper meta tags and social media integration

## 🚀 Development Guidelines

### Environment Setup
1. **Install Dependencies**: Use `pnpm install` at monorepo root
2. **Start Development**: Run `pnpm dev --port 3100` from landing directory
3. **Static Build**: Use `pnpm build` for static site generation
4. **Preview Build**: Use `pnpm start` to preview static build

### Code Quality Standards
- **TypeScript**: All code must be fully typed with strict mode
- **ESLint**: Follow `@jirum/eslint-config-jirum` workspace configuration
- **Prettier**: Use `@jirum/prettier` for consistent code formatting
- **Component Structure**: Maintain clean, reusable component architecture

### Component Development
- **Reusable Components**: Create components in `src/app/components/` directory
- **Section-based Organization**: Group components by page sections
- **Type Safety**: Use TypeScript interfaces for all props and state
- **Responsive Design**: Implement mobile-first responsive design patterns

### Styling Guidelines
- **Tailwind CSS**: Use utility classes for consistent styling
- **Class Merging**: Utilize `cn()` utility for conditional classes
- **Animation**: Implement smooth animations with Motion library
- **Performance**: Optimize for fast loading and smooth interactions

### SEO and Performance
- **Meta Tags**: Implement proper SEO meta tags and descriptions
- **Open Graph**: Configure social media sharing previews
- **Image Optimization**: Use appropriate image formats and sizes
- **Core Web Vitals**: Optimize for search engine ranking factors

## 🔗 Dependencies and Integrations

### Workspace Dependencies
- **`@jirum/eslint-config-jirum`**: Shared ESLint configuration
- **`@jirum/prettier`**: Shared Prettier configuration
- **`@jirum/tsconfig`**: Shared TypeScript configuration

### External Integrations
- **App Store Links**: Direct integration with iOS and Android app stores
- **Social Media**: Open Graph tags for social media sharing
- **Analytics**: Ready for analytics service integration
- **CDN**: Optimized for edge delivery through Cloudflare

### Build Configuration
- **Static Export**: Configured for `output: 'export'`
- **Port Configuration**: Development server on port 3100
- **Image Handling**: Unoptimized images for static hosting
- **SEO Headers**: Proper robots and meta tag configuration

### Deployment
- **Cloudflare Workers**: Edge deployment configuration
- **Static Hosting**: Optimized for static site hosting platforms
- **Build Output**: Exported to `out/` directory for deployment
- **Environment**: Production-ready with proper optimization

## 📊 Key Features and Functionality

### Marketing Content
- **Hero Section**: Compelling value proposition and app download CTAs
- **Feature Showcase**: Detailed presentation of app features and benefits
- **Problem-Solution**: Address user pain points with Jirum-Alarm solutions
- **Social Proof**: User testimonials and community engagement

### User Experience
- **Responsive Design**: Mobile-first design for all device sizes
- **Smooth Animations**: Engaging scroll-triggered animations
- **Fast Loading**: Optimized for quick page loads
- **Intuitive Navigation**: Clear user journey and conversion paths

### App Download Integration
- **Direct Store Links**: One-click download to iOS and Android stores
- **QR Code Support**: Mobile-friendly QR code for app downloads
- **Feature Highlights**: Key app features to drive downloads
- **Call-to-Action**: Strategic placement of download buttons

### SEO Optimization
- **Meta Tags**: Optimized title, description, and keywords
- **Open Graph**: Social media sharing optimization
- **Structured Data**: Schema markup for search engines
- **Performance**: Core Web Vitals optimization

## 🎨 Design and Branding

### Visual Identity
- **Brand Colors**: Consistent use of Jirum-Alarm brand colors
- **Typography**: Korean-optimized font hierarchy with Pretendard
- **Imagery**: High-quality visuals showcasing app features
- **Iconography**: Custom icons for feature representation

### Content Strategy
- **Value Proposition**: Clear communication of app benefits
- **User Pain Points**: Address common hot deal aggregation challenges
- **Feature Benefits**: Focus on user outcomes rather than technical features
- **Conversion Focus**: Strategic CTAs to drive app downloads

### Animation and Interaction
- **Scroll Animations**: Engaging animations triggered by user scrolling
- **Hover Effects**: Interactive feedback for user engagement
- **Loading States**: Smooth transitions and loading indicators
- **Mobile Optimization**: Touch-friendly interactions and gestures

---

**Development Notes**: This landing page is designed as a static marketing website with focus on user acquisition and brand presentation. Prioritize performance, SEO optimization, and mobile responsiveness for maximum conversion effectiveness.