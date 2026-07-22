# TODOS

## 공용 Chip 추출 + /trending/live 필터 바 이식

- **What**: `SearchFilterBar`의 Chip을 shared/ui로 추출하고, /trending/live(실시간 탭)에도 정렬·출처 필터 바를 얹어 "탐색" 화면 완성.
- **Why**: 탐색 UX 논의(2026-07-22)의 출발점이 live 탭이었고, /search 필터 v1a로 부품(Chip·필터 훅·백엔드 배선)이 이미 완성됨. live는 keyword 없는 DB 경로라 백엔드 추가 작업 없음.
- **Pros**: 검색 밖에서도 탐색 UX 제공, 칩 코드 중복 제거.
- **Cons**: live 탭은 카테고리 스와이프 탭 구조라 필터 바 결합 시 UI 검증 별도 필요.
- **Context**: `src/widgets/search/ui/SearchFilterBar.tsx`(칩)·`useSearchFilters`(URL 상태) 재사용. live 정렬 하드코딩 위치는 `useLiveViewModel.ts`. 배경은 세션 메모리 `search-vs-browse-filter-architecture` 참조.
- **Depends on**: /search 필터 v1a 커밋(2af6ff0c + 디자인 리뷰 후속 커밋).
