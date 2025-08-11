## 아키텍처 작업 요약 (1p)

### 현재 상태
- 레이어/의존
  - shared ← entities ← features ← widgets ← app 단방향 적용
  - 배럴 엔트리: 각 루트 `index.ts` (내부 경로 import 금지)
  - 규칙 문서: `.cursor/rules/{architecture.mdc, imports.mdc, prefetch-ssr.mdc}`

- 모듈 별칭/ESLint
  - tsconfig: `@shared/*`, `@entities/*`, `@features/*`, `@widgets/*`
  - ESLint: 루트 배럴만 허용, 피처 간 직접 의존 금지, import 정렬 일관화

- 위젯(라우트 독립 도메인 기준)
  - ranking: `@widgets/ranking` (Desktop/Mobile 섹션 제공)
  - live-hotdeal: `@widgets/live-hotdeal`
  - recommend: `@widgets/recommend/RecommendPrefetch` (서버 prefetch)
  - product-detail: `@widgets/product-detail` (Info/Stats/Additional 분리 예정 → 적용 완료)

- 피처 응집/배럴 치환
  - products/search/recommended/auth: 루트 배럴 사용으로 내부 경로 제거
  - product-detail: 상세 UI/훅을 `@features/product-detail`로 묶어 외부 사용 통일

- 서버 prefetch + 스트리밍 SSR
  - 서버에서 QueryClient로 prefetch → HydrationBoundary 전달
  - 클라이언트는 `useSuspenseQuery`로 하이드레이션 즉시 사용

### 남은 TODO (우선순위 순)
1) 상세 페이지 정리
   - 기존 라우트 내부 `fetcher/*` 제거(대체: `@widgets/product-detail/*Prefetch`)
   - 상세 관련 흩어진 컴포넌트/훅을 `@features/product-detail`로 완전 이관(파일 이동 포함)

2) 배럴 치환 잔여
   - `@features/*/components/*` 직접 참조 남은 곳 → `@features/<name>`로 치환 완료 확인
   - `features/categories`, `features/personal`에 `index.ts` 추가 후 외부 참조 정리

3) 위젯화 확대(선택)
   - 홈: 라이브핫딜 prefetch는 불필요 판단(현 상태 유지). 필요 시 첫 페이지만 prefetch 위젯 추가
   - 검색/트렌딩 상단 데이터가 있다면 prefetch 위젯 검토

4) 품질 게이트
   - CI: `tsc --noEmit`, `next lint`, `next build` 그린 유지
   - ESLint 경고 점진 해소(react-hooks, import-x no-named-as-default-member 등)

### 브랜치/커밋 정책
- 작업 브랜치: `refactor/feature-isolation`
- 커밋/푸시: “요청 시”에만 수행 (기본 보류)

### 작업 지침(요약)
- 페이지는 “배치만”, 위젯은 “조립+prefetch”, 피처는 “UI/훅”, 엔티티는 “쿼리/타입”
- 외부 import는 `@features/<name>`, `@widgets/<name>`만 사용(내부 경로 금지)
- 도메인 기준 디렉터리: `widgets/ranking`, `widgets/live-hotdeal`, `widgets/product-detail`, `widgets/recommend`

### 유용한 경로
- ESLint: apps/web/eslint.config.mjs
- TSConfig: apps/web/tsconfig.json
- 위젯 예시: apps/web/src/widgets/recommend/RecommendPrefetch.tsx
- 상세 위젯: apps/web/src/widgets/product-detail/


