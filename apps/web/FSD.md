# Web App FSD Structure (apps/web)

## Scope
- Analyzed path: `apps/web/src`
- Focus: Feature-Sliced Design (FSD) layers, slices, segments, and import conventions (current branch)

## Layer Map (Observed)
- Present layers: `app`, `shared`, `entities`, `features`, `widgets`
- Not present at top-level: `pages`, `processes`
- Non-FSD top-level modules in `src`: `assets`, `components`, `constants`, `fonts`, `graphql`, `hooks`, `lib`, `mocks`, `state`, `style`, `util`, plus runtime files

## app (Next.js App Router)
Top-level entries under `apps/web/src/app`:
- Route groups: `(app)`, `(desktop-ready)`, `(mobile)`
- Supporting areas: `actions`, `api`, `sitemap`, `robots.txt`
- Root files: `layout.tsx`, `global-error.tsx`, `not-found.tsx`, `manifest.ts`
- Static assets: `apple-icon.png`, `icon.png`, `favicon.ico`
- `(app)` contains `providers` and `react-query`
- `(desktop-ready)` routes: `(home)`, `components`, `curation`, `products`, `recommend`, `search`, `trending`
- `(mobile)` routes: `alarm`, `like`, `login`, `mypage`, `policies`, `signup`

## shared (cross-cutting segments)
Top-level segments under `apps/web/src/shared`:
- `api`, `hooks`, `lib`, `types`, `ui`

## entities (domain data)
Slices under `apps/web/src/entities`:
- `auth`, `category`, `comment`, `notification`, `product`, `promotion`, `wishlist`
Observed layout notes:
- Mostly flat query/api files per slice (e.g., `*.queries.ts`)
- `promotion` has subfolders `api`, `lib`, `model`

## features (user flows)
Slices under `apps/web/src/features`:
- `auth`, `banner`, `categories`, `personal`, `product-detail`, `products`
Observed segment patterns:
- `auth`: `lib`
- `banner`: `images`, `items` (+ root file `BannerItem.tsx`)
- `categories`: `components`, `types`
- `personal`: `components`
- `product-detail`: `components`, `controls`, `prefetch`
- `products`: `carousel`, `grid`, `hooks`, `image`, `list`, `ranking`, `sections`, `skeleton` (+ root files)

## widgets (page composition)
Slices under `apps/web/src/widgets`:
- `home`, `live-hotdeal`, `recommend`, `search`
Observed segment patterns:
- `home`: flat tsx files only
- `live-hotdeal`: `hooks` (+ root components and `index.ts`)
- `recommend`: flat tsx files (+ `index.ts`)
- `search`: `components`, `hooks` (+ root `SearchPage.tsx`)

## Non-FSD top-level modules
- `apps/web/src/graphql`: GraphQL operation modules (auth/category/comment/keyword/like/notification/product/wishlist)
- `apps/web/src/assets`, `fonts`, `style`, `mocks`: cross-cutting assets/styles outside `shared`
- Runtime files: `apps/web/src/instrumentation.ts`, `apps/web/src/instrumentation-client.ts`, `apps/web/src/middleware.ts`

## Import Aliases & Dependency Direction
Aliases configured in `apps/web/tsconfig.json`:
- `@/*` -> `./src/*`
- `@shared/*` -> `./src/shared/*`
- `@entities/*` -> `./src/entities/*`
- `@features/*` -> `./src/features/*`
- `@widgets/*` -> `./src/widgets/*`

Observed dependency flow (examples):
- app -> features/shared
  - `apps/web/src/app/(desktop-ready)/products/[id]/(detail)/page.tsx` imports `@/features/product-detail/prefetch` and `@shared/api/product`
- app -> widgets
  - `apps/web/src/app/(desktop-ready)/search/desktop/SearchLayout.tsx` imports `@/widgets/search/components/SearchInput`
- widgets -> entities/shared
  - `apps/web/src/widgets/home/DynamicProductSection.tsx` imports `@/entities/promotion/...`
  - `apps/web/src/widgets/search/components/ProductNotFound.tsx` imports `@shared/...`
- features -> entities/shared
  - `apps/web/src/features/product-detail/components/ExpiredProductWarning.tsx` imports `@/entities/product` and `@/shared/api/gql/graphql`

## Notes
- The current branch mixes FSD layers with legacy-style top-level modules (`components`, `hooks`, `lib`, `state`, etc.).
- `shared` is narrower here than in other branches; assets/fonts/styles live at top-level.
