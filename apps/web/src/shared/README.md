## Shared Layer Guide

Cross-cutting 상태와 유틸을 위한 최소 규칙입니다.

- `shared/model`: 글로벌/크로스 도메인 상태(atom)와 계산 로직만 둡니다. 비즈니스 도메인 의존 금지.
- `shared/hooks`: UI/페이지가 재사용하는 훅. 상태는 반드시 `shared/model`에서 주입받습니다.
- `entities/*/model`: 서버 데이터·도메인 규칙을 보관합니다. UI 훅/컴포넌트는 `features`에서 연결합니다.
- `features/*/model`: 특정 사용자 흐름(예: 댓글 편집, 알림 설정)의 상태·파생값을 둡니다.
- UI 전용 단발 상태는 지역 `useState`를 우선 사용하고, 전역 필요 시 위 스코프를 따라 올라갑니다.

참고 경로

- Hydration/디바이스/세션: `shared/model/{hydration,device,session}.ts`
- UI 스크롤/헤더 노출: `shared/model/ui.ts`

### API / Query Guardrails

- 엔티티 레이어에서 필수 데이터는 `select`로 검증하고, nullable 데이터는 그대로 유지해 상위 레이어 분기를 단순화합니다.
- 무한/페이지네이션 키에는 필터·정렬·검색 커서(offset/searchAfter 등) 의존 파라미터를 모두 포함합니다.
- 도메인별 쿼리/서비스는 `entities/*`에, 호출/흐름 제어는 `features/*`에, 화면 조립은 `widgets/*`·`app`에 위치시킵니다.
