<!-- Parent: ../AGENTS.md -->
# Admin App - Jirum-Alarm Administrative Dashboard

**Administrative Interface** - Management and analytics dashboard for the Jirum-Alarm platform

## 🎯 App Purpose and Role

The Admin app serves as the central administrative interface for the Jirum-Alarm platform, providing tools for:

- **Analytics and Monitoring**: Real-time data visualization and performance metrics
- **Content Management**: Deal curation, keyword management, and content moderation
- **User Management**: User statistics, behavior analysis, and account administration
- **System Administration**: Platform configuration and operational oversight

This app is designed for internal use by administrators, moderators, and content managers to oversee the hot deal aggregation service.

## 📁 Key Files and Configuration

### Core Configuration
- **`package.json`**: Dependencies and scripts for the admin dashboard
- **`next.config.mjs`**: Next.js configuration with standalone output and SEO headers
- **`tsconfig.json`**: TypeScript configuration extending workspace settings
- **`tailwind.config.ts`**: Tailwind CSS configuration for admin UI styling
- **`eslint.config.mjs`**: ESLint configuration using workspace preset
- **`prettier.config.mjs`**: Code formatting configuration

### Development and Deployment
- **`Makefile`**: Docker development and production deployment commands
- **`.env.development.sample`**: Environment variables template for development
- **`.env.production.sample`**: Environment variables template for production
- **`codegen.ts`**: GraphQL code generation configuration
- **`schema.graphql`**: GraphQL schema for API integration

### Build and Runtime
- **`postcss.config.js`**: PostCSS configuration for Tailwind CSS processing
- **`middleware.ts`**: Next.js middleware for authentication and routing
- **`next-env.d.ts`**: Next.js TypeScript type definitions

## 🏗️ Source Code Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   └── signin/              # Sign-in interface
│   ├── hotdeal/                 # Hot deal management
│   │   └── keyword/             # Keyword administration
│   ├── post/                    # Post management
│   │   └── reservation/         # Content reservation system
│   ├── product/                 # Product management
│   │   └── matching/            # Product matching tools
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Dashboard home page
├── components/                   # Reusable UI components
│   ├── Header/                  # Navigation header
│   ├── Sidebar/                 # Navigation sidebar
│   ├── Layouts/                 # Page layout components
│   ├── Switchers/              # Toggle and switch components
│   └── icons/                  # Icon components
├── lib/                         # Utility libraries
│   └── graphql.ts              # GraphQL client setup
├── utils/                       # Helper functions
│   ├── date.ts                 # Date manipulation utilities
│   ├── event.ts                # Event handling utilities
│   └── text.ts                 # Text processing utilities
├── types/                       # TypeScript type definitions
│   ├── keyword.ts              # Keyword-related types
│   └── verification.ts         # Verification system types
├── constants/                   # Application constants
│   ├── endpoint.ts             # API endpoint definitions
│   ├── hotdeal.ts              # Hot deal constants
│   └── limit.ts                # System limits and thresholds
├── hooks/                       # Custom React hooks
│   └── useLocalStorage.tsx    # Local storage management
├── css/                         # Global styles
│   └── satoshi.css             # Font family definitions
└── fonts/                       # Font assets
    └── Satoshi/                # Satoshi font family files
```

## ⚙️ Technology Stack

### Core Framework
- **Next.js 15.4.10**: React framework with App Router
- **React 19.1.2**: UI library with latest features
- **TypeScript 5.8.3**: Type-safe JavaScript development

### Data and State Management
- **Apollo Client 3.10.4**: GraphQL client with Next.js integration
- **GraphQL 16.8.1**: Query language and runtime
- **React Intersection Observer 9.10.3**: Viewport detection utilities

### UI and Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization
- **Custom Components**: Specialized admin UI components

### Data Visualization
- **ApexCharts 3.45.2**: Chart library for analytics
- **React ApexCharts 1.4.1**: React wrapper for ApexCharts
- **TanStack React Virtual 3.13.8**: Virtual scrolling for large datasets

### Date and Time Handling
- **Day.js 1.11.10**: Lightweight date manipulation library
- **Flatpickr 4.6.13**: Date picker component

### Development Tools
- **GraphQL Code Generator**: Type-safe GraphQL operations
- **ESLint**: Code quality and linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🚀 Development Guidelines

### Environment Setup
1. **Install Dependencies**: Use `pnpm install` at monorepo root
2. **Environment Variables**: Copy `.env.development.sample` to `.env.local`
3. **Start Development**: Run `pnpm dev` from admin directory
4. **GraphQL Code Generation**: Run `pnpm code-gen` after schema changes

### Code Quality Standards
- **TypeScript**: All code must be fully typed with strict mode
- **ESLint**: Follow `@jirum/eslint-config-jirum` workspace configuration
- **Prettier**: Use `@jirum/prettier` for consistent code formatting
- **GraphQL**: Use generated types and proper query structure

### Component Development
- **Reusable Components**: Create components in `src/components/` directory
- **Page Components**: Place page-specific components in `src/app/*/components/`
- **Type Safety**: Use TypeScript interfaces for all props and state
- **Styling**: Utilize Tailwind CSS classes with consistent design patterns

### Data Management
- **GraphQL Queries**: Use Apollo Client with proper error handling
- **State Management**: Use React hooks for local state
- **Data Fetching**: Implement proper loading and error states
- **Caching**: Configure Apollo Client caching strategies

### Authentication and Security
- **Middleware**: Implement authentication checks in `middleware.ts`
- **Route Protection**: Secure admin routes with proper authorization
- **Environment Variables**: Keep sensitive data in environment files
- **API Security**: Use proper headers and validation for API calls

## 🔗 Dependencies and Integrations

### Workspace Dependencies
- **`@jirum/eslint-config-jirum`**: Shared ESLint configuration
- **`@jirum/prettier`**: Shared Prettier configuration
- **`@jirum/tsconfig`**: Shared TypeScript configuration

### External Integrations
- **GraphQL API**: Connection to main platform API
- **Analytics Services**: Integration with monitoring and analytics platforms
- **File Upload**: Support for image and document uploads
- **Real-time Data**: WebSocket connections for live updates

### Docker Support
- **Development Environment**: `make build-development && make start-development`
- **Production Environment**: `make build-production && make start-production`
- **Port Configuration**: Development on port 3000, Production on port 3002

### Build and Deployment
- **Standalone Output**: Configured for containerized deployment
- **Image Optimization**: Disabled for admin interface
- **SEO Configuration**: Proper meta tags and robots settings
- **Static Assets**: Optimized for production serving

## 📊 Key Features and Functionality

### Analytics Dashboard
- **Real-time Metrics**: Live data visualization and monitoring
- **User Statistics**: User behavior and engagement analytics
- **Performance Monitoring**: System performance and health metrics
- **Custom Reports**: Configurable reporting and data export

### Content Management
- **Deal Curation**: Manual review and approval of hot deals
- **Keyword Management**: Keyword weight and category management
- **Content Moderation**: User-generated content review tools
- **Category Organization**: Deal categorization and tagging

### User Administration
- **User Management**: User account administration and moderation
- **Permission Control**: Role-based access control system
- **Activity Monitoring**: User activity and behavior tracking
- **Support Tools**: Customer support and issue resolution

### System Configuration
- **Platform Settings**: System-wide configuration management
- **Feature Flags**: Feature toggle and rollout management
- **API Configuration**: External service integration settings
- **Security Settings**: Authentication and authorization configuration

---

**Development Notes**: This admin dashboard is designed for internal use with focus on data visualization, content management, and system administration. Always follow security best practices and ensure proper authentication for all admin features.