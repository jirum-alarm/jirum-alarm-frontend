# TODOS

## 공용 Chip 추출 + /trending/live 필터 바 이식

- **What**: `SearchFilterBar`의 Chip을 shared/ui로 추출하고, /trending/live(실시간 탭)에도 정렬·출처 필터 바를 얹어 "탐색" 화면 완성.
- **Why**: 탐색 UX 논의(2026-07-22)의 출발점이 live 탭이었고, /search 필터 v1a로 부품(Chip·필터 훅·백엔드 배선)이 이미 완성됨. live는 keyword 없는 DB 경로라 백엔드 추가 작업 없음.
- **Pros**: 검색 밖에서도 탐색 UX 제공, 칩 코드 중복 제거.
- **Cons**: live 탭은 카테고리 스와이프 탭 구조라 필터 바 결합 시 UI 검증 별도 필요.
- **Context**: `src/widgets/search/ui/SearchFilterBar.tsx`(칩)·`useSearchFilters`(URL 상태) 재사용. live 정렬 하드코딩 위치는 `useLiveViewModel.ts`. 배경은 세션 메모리 `search-vs-browse-filter-architecture` 참조.
- **Depends on**: /search 필터 v1a 커밋(2af6ff0c + 디자인 리뷰 후속 커밋).

## /search 정렬·필터 바 sticky 고정

- **What**: 정렬 줄(또는 필터 바)을 스크롤 시 상단 고정(sticky)해 깊은 결과에서도 정렬·초기화에 바로 접근.
- **Why**: 무한스크롤로 깊이 내려간 파워유저가 정렬/필터를 바꾸려면 최상단까지 복귀해야 함(2026-07-23 /search 2차 디자인 리뷰 이슈4). 쿠팡·무신사 등 커머스 표준.
- **Pros**: 필터 사용자의 반복 조작 마찰 제거.
- **Cons**: 세 줄 필터 바 전체 sticky는 모바일 화면을 ~180px 잠식. '정렬 줄만 sticky'는 헤더/검색창 숨김 로직(useInputHideOnScroll)과 z-index·오프셋이 겹쳐 설계 필요.
- **Context**: 필터 바 = `SearchFilterBar.tsx`, 헤더 숨김 훅 = `useInputHideOnScroll.ts`. 정렬 줄만 분리해 sticky top-0 + 헤더 가시성 연동이 유력.
- **Depends on**: 없음(독립).
