# 지름알림

## How to start

```
pnpm install
pnpm dev

pnpm dev:mock // MSW로 목 데이터를 사용하고 싶은 경우
```

## Structure

```xml
.
├── public
│   ├── assets
│   └── icon
└── src
    ├── app
    │   ├── user
    │   │   ├── components
    │   │   ├── hooks
    │   │   ├── setting
    │   │   │   └── page.tsx
    │   │   └── page.tsx
    │   ├── layout.tsx
    │   └── page.tsx
    ├── hooks
    ├── components
    │   ├── common
    │   │   ├── icon
    │   │   └── button
    │   └── layout
    ├── constants
    ├── utils
    ├── types
    ├── state
    ├── styles
    ├── lib
    └── graphql
```

## MSW

`.env`의 `NEXT_PUBLIC_API_MOCKING='disable'` 값을 `enable`로 변경하시거나 `pnpm dev:mock`으로 MSW의 목 데이터를 사용가능합니다.
