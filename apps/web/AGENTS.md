<!-- Parent: ../AGENTS.md -->
# Web App - Jirum-Alarm Main Application

**Core Application** - Primary web interface for the Jirum-Alarm hot deal aggregation platform

## 🎯 App Purpose and Role

The Web app serves as the main user-facing application for the Jirum-Alarm platform, providing comprehensive hot deal aggregation and management features:

- **Hot Deal Aggregation**: Real-time collection and display of hot deals from multiple Korean communities
- **Category-based Organization**: Deals organized by categories for easy browsing and discovery
- **Search and Discovery**: Advanced search functionality with keyword recommendations
- **User Personalization**: Custom notifications, wishlists, and personalized recommendations
- **Community Integration**: Comment systems, social features, and user engagement tools

This app is the primary web application used by end-users to access Jirum-Alarm's hot deal aggregation services.

## 📁 Key Files and Configuration

### Core Configuration
- **`package.json`**: Comprehensive dependencies for full-stack web application
- **`next.config.js`**: Advanced Next.js configuration with PWA, Sentry, and optimization
- **`tsconfig.json`**: TypeScript configuration extending workspace settings
- **`eslint.config.mjs`**: ESLint configuration using workspace preset
- **`prettier.config.mjs`**: Code formatting configuration

### Development Tools
- **`codegen.ts`**: GraphQL code generation configuration
- **`.storybook/`**: Storybook configuration and stories for component development
- **`tailwind.config.js`**: Tailwind CSS configuration with custom utilities
- **`postcss.config.mjs`**: PostCSS configuration for Tailwind CSS processing

### Build and Optimization
- **`next-pwa`**: Progressive Web App configuration
- **`@next/bundle-analyzer`**: Bundle size analysis tools
- **`@sentry/nextjs`**: Error tracking and performance monitoring
- **`sharp`**: Image optimization and processing

### Testing and Quality
- **`knip`**: Unused code and dependency detection
- **`msw`**: Mock Service Worker for API mocking and development
- **`husky`**: Git hooks for pre-commit validation
- **`lint-staged`**: Linting for staged files

## 🏗️ Source Code Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # App-specific layout group
│   │   ├── providers/            # Context and state providers
│   │   │   ├── ReactQueryProviders.tsx # React Query setup
│   │   │   ├── appProvier.tsx    # App-specific providers
│   │   │   └── index.ts         # Provider exports
│   │   ├── deviceId.tsx         # Device identification
│   │   └── react-query/         # React Query configuration
│   │       └── query-client.tsx  # Query client setup
│   ├── (desktop-ready)/         # Desktop-optimized routes
│   │   ├── recommend/           # Recommendation pages
│   │   ├── search/              # Search functionality pages
│   │   └── trending/            # Trending deals pages
│   ├── api/                     # API routes
│   │   └── graphql/             # GraphQL API endpoint
│   │       └── route.ts         # GraphQL server implementation
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   ├── global-error.tsx         # Global error boundary
│   ├── manifest.ts              # PWA manifest
│   ├── sitemap/                 # Sitemap generation
│   └── robots.txt/              # SEO robots configuration
├── widgets/                     # Feature-based widget architecture
│   ├── layout/                  # Layout and navigation widgets
│   │   ├── index.ts
│   │   └── ui/desktop/          # Desktop-specific layout components
│   ├── home/                    # Home page widgets
│   ├── search/                  # Search functionality widgets
│   ├── recommend/               # Recommendation system widgets
│   ├── product-detail/          # Product detail page widgets
│   ├── comment/                 # Comment system widgets
│   ├── curation/                # Content curation widgets
│   ├── live-hotdeal/            # Live hot deal widgets
│   └── like/                    # Like/favorite widgets
├── graphql/                     # GraphQL operations and types
│   ├── auth.ts                  # Authentication queries/mutations
│   ├── category.ts              # Category-related operations
│   ├── comment.ts               # Comment system operations
│   ├── keyword.ts               # Keyword management operations
│   ├── like.ts                  # Like/favorite operations
│   ├── notification.ts          # Notification operations
│   ├── product.ts               # Product operations
│   ├── wishlist.ts              # Wishlist operations
│   ├── interface/               # GraphQL type interfaces
│   └── index.ts                 # GraphQL exports
├── components/                   # Reusable UI components
│   ├── common/                  # Common utility components
│   ├── layout/                  # Layout components
│   └── ...                      # Additional component directories
├── hooks/                       # Custom React hooks
├── utils/                       # Utility functions
├── types/                       # TypeScript type definitions
├── state/                       # Global state management
├── styles/                      # Global styles and themes
├── mocks/                       # Mock Service Worker configurations
└── assets/                      # Static assets
    ├── icons/                   # Icon assets
    └── images/                  # Image assets
```

## ⚙️ Technology Stack

### Core Framework
- **Next.js 15.4.10**: React framework with App Router and advanced features
- **React 19.1.2**: Latest React version with new features
- **TypeScript 5.8.3**: Type-safe JavaScript development

### Data Management
- **Apollo Client 3.13.6**: GraphQL client with Next.js integration
- **TanStack React Query 5.71.10**: Server state management and caching
- **Jotai 2.12.4**: Client state management for atomic state
- **GraphQL 16.10.0**: GraphQL query language and runtime
- **GraphQL WS 5.16.2**: Real-time GraphQL subscriptions

### UI and Styling
- **Tailwind CSS 4.1.11**: Modern utility-first CSS framework
- **Tailwind Merge 3.3.1**: Utility for merging Tailwind CSS classes
- **Class Variance Authority 0.7.1**: Component variant management
- **CLSX 2.1.1**: Utility for constructing className strings
- **Motion 12.6.3**: Animation library for smooth interactions
- **Swiper 11.2.6**: Carousel and slider component library

### Form and Input Handling
- **Nuqs 2.4.1**: URL state management for search parameters
- **React Scroll 1.9.3**: Smooth scrolling utilities
- **Vaul 1.1.2**: Drawer/sheet component for mobile interactions

### Real-time and Notifications
- **Firebase 10.14.1**: Push notifications and real-time features
- **React Intersection Observer 9.16.0**: Viewport detection utilities

### Analytics and Monitoring
- **Sentry 10.21.0**: Error tracking and performance monitoring
- **Mixpanel 2.63.0**: User behavior analytics

### Development Tools
- **Storybook 8.6.12**: Component development and documentation
- **Mock Service Worker 2.7.3**: API mocking for development
- **ES Toolkit 1.39.10**: Modern JavaScript utility library
- **UUID 13.0.0**: Unique identifier generation

### Build and Optimization
- **Sharp 0.34.5**: High-performance image processing
- **Bundle Analyzer**: Webpack bundle analysis
- **Critters 0.0.25**: CSS optimization for better performance

## 🚀 Development Guidelines

### Environment Setup
1. **Install Dependencies**: Use `pnpm install` at monorepo root
2. **Development Server**: Run `pnpm dev` for normal development
3. **Mock Development**: Use `pnpm dev:mock` for MSW-based development
4. **GraphQL Code Generation**: Run `pnpm code-gen` after schema changes
5. **Storybook**: Run `pnpm storybook` for component development

### Code Quality Standards
- **TypeScript**: All code must be fully typed with strict mode
- **ESLint**: Follow `@jirum/eslint-config-jirum` workspace configuration
- **Prettier**: Use `@jirum/prettier` for consistent code formatting
- **Storybook**: Create stories for all reusable components
- **Knip**: Run `pnpm knip` to detect unused code

### Widget Architecture
- **Feature-based Organization**: Organize code by features/widgets
- **Separation of Concerns**: Keep UI, logic, and state separate
- **Type Safety**: Use TypeScript interfaces for all data structures
- **Reusability**: Design widgets to be reusable across different pages

### Data Management Patterns
- **GraphQL Operations**: Use generated types and proper error handling
- **React Query**: Implement proper cache management and invalidation
- **Jotai**: Use for client-side state that needs to be shared
- **Optimistic Updates**: Implement for better user experience

### Performance Optimization
- **Code Splitting**: Implement proper lazy loading for components
- **Image Optimization**: Use Next.js Image component with proper configuration
- **Bundle Analysis**: Regularly analyze bundle size and optimize
- **Caching**: Implement proper caching strategies for API calls

### Testing and Development
- **MSW**: Use Mock Service Worker for consistent development experience
- **Storybook**: Document and test components in isolation
- **Component Testing**: Use Storybook for component interaction testing
- **API Mocking**: Maintain comprehensive API mocks for offline development

## 🔗 Dependencies and Integrations

### Workspace Dependencies
- **`@jirum/eslint-config-jirum`**: Shared ESLint configuration
- **`@jirum/prettier`**: Shared Prettier configuration
- **`@jirum/tsconfig`**: Shared TypeScript configuration

### External Services
- **GraphQL API**: Connection to backend GraphQL services
- **Firebase**: Push notifications and real-time features
- **Sentry**: Error tracking and performance monitoring
- **GA4 (GTM)·Clarity**: User analytics and behavior tracking

### PWA Features
- **Service Worker**: Offline functionality and background sync
- **Web App Manifest**: Native app-like experience
- **Push Notifications**: Firebase Cloud Messaging integration
- **Offline Support**: Cached content for offline browsing

### Development Infrastructure
- **Storybook**: Component development and documentation
- **MSW**: API mocking for development and testing
- **GraphQL Code Generator**: Type-safe GraphQL operations
- **Bundle Analyzer**: Performance optimization tools

## 📊 Key Features and Functionality

### Hot Deal Aggregation
- **Real-time Collection**: Live updates from multiple Korean communities
- **Category Organization**: Deals categorized by type and interest
- **Quality Filtering**: Automated and manual content curation
- **Trending Detection**: Algorithmic identification of popular deals

### Search and Discovery
- **Advanced Search**: Full-text search with filtering and sorting
- **Keyword Recommendations**: AI-powered search suggestions
- **Personalized Results**: Search results based on user preferences
- **Search History**: Recent searches and saved queries

### User Personalization
- **Custom Notifications**: User-specific deal alerts
- **Wishlist Management**: Save and track favorite deals
- **Personalized Recommendations**: AI-driven content suggestions
- **User Preferences**: Customizable settings and filters

### Community Features
- **Comment System**: User discussions and feedback
- **Like/Favorite System**: Social engagement features
- **User Profiles**: Personalized user experiences
- **Social Sharing**: Deal sharing to external platforms

### Performance Features
- **Progressive Web App**: Native app-like experience
- **Offline Support**: Cached content for offline browsing
- **Push Notifications**: Real-time deal alerts
- **Optimized Images**: Fast loading with proper optimization

## 🎨 Design and User Experience

### Responsive Design
- **Mobile-first**: Optimized for mobile devices with desktop enhancements
- **Adaptive Layout**: Different layouts for mobile, tablet, and desktop
- **Touch Interactions**: Mobile-friendly touch gestures and interactions
- **Performance**: Fast loading and smooth interactions

### Accessibility
- **WCAG Compliance**: Proper semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Proper content structure and descriptions
- **Color Contrast**: Proper contrast ratios for readability

### Animation and Interactions
- **Micro-interactions**: Subtle animations for user feedback
- **Page Transitions**: Smooth navigation between pages
- **Loading States**: Proper loading indicators and skeleton screens
- **Error Handling**: Graceful error display and recovery

---

**Development Notes**: This is the main user-facing application with complex feature requirements. Prioritize performance, user experience, and maintainability. Follow the widget architecture pattern for scalable development and maintain comprehensive testing for all features.