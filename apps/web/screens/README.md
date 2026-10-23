# 화면 하네스 (`apps/web/screens`)

타입·단위 테스트는 «그려진 화면»을 못 본다. 겹침·안 보임·다크 대비·가로 넘침 같은 깨짐은 실제로 그려 봐야 보이는데,
운영 API 로 띄우면 데이터가 매번 달라 같은 상태를 다시 만들 수 없다. 그래서 운영 응답을 한 번 녹화해 두고(`fixtures/`),
그 데이터로 web 을 띄워 주요 화면을 찍고 점검한다. AI 가 화면 변경을 «직접 보고» 확인하는 길이다.

```bash
pnpm --filter web screens                 # next dev + 녹화 데이터로 전부 (2~3분)
pnpm --filter web screens -g keyword-hub  # 화면 하나만 (-g 는 테스트 이름 grep)
pnpm --filter web screens --project=mobile-dark
pnpm --filter web screens:record          # 운영 API 로 fixtures 새로 녹화 (pages.ts 를 바꿨거나 새 쿼리를 쓸 때)

# CI 와 같은 운영 빌드로:
NEXT_PUBLIC_SERVICE_URL=http://localhost:3010 NODE_ENV=production pnpm --filter web exec next build --webpack
SCREENS_SERVER=start pnpm --filter web screens
```

결과는 `screens/.out/`:
- `report.md` — 맨 위 종류별 개수, 아래 화면별 문제. **여기부터 읽는다.**
- `<project>/<화면>.png` — 첫 화면(고정 헤더·탭바 포함, 사용자가 처음 보는 그대로)
- `<project>/<화면>.full.png` — 아래로 4화면(고정 요소는 숨김)
- project = `mobile-light`·`mobile-dark`·`desktop-light`·`desktop-dark`. 빈·에러 상태는 `mobile-light/<화면>.empty.png`·`.error.png`

## 무엇을 막고 무엇을 보고하나

| 점검 | 기본 데이터 | 빈·에러 상태 |
|---|---|---|
| 페이지 JS 오류(pageerror·console.error) | ❌ 막음 | ⚠️ 보고 |
| 오류 경계(「화면을 불러오지 못했어요」)·HTTP 5xx | ❌ 막음 | — (에러 상태에선 정상일 수 있음) |
| 녹화 안 된 쿼리 | ❌ 막음 → `screens:record` | ⚠️ 보고 |
| 가로 넘침(폰에서 옆으로 밀림) | ❌ 막음 | ❌ 막음 |
| 글자끼리 겹침 | ⚠️ 보고 | ⚠️ 보고 |
| 접근성(대비·이름 없는 링크/버튼/이미지, axe) | ⚠️ 보고 | ⚠️ 보고 |

⚠️ 는 이미 있는 것이 남아 있어 보고만 한다. 0 으로 줄인 항목은 막는 쪽(❌)으로 올린다.

## 고정 데이터 서버 (`fixture-server.mts`)

web 의 서버 렌더(GRAPHQL_ENDPOINT·API_URL)와 브라우저 프록시(`/api/graphql`) 요청이 전부 여기로 온다.
- 쿼리는 `fixtures/<오퍼레이션>/<변수 해시>.json` 에서. 녹화 시각과 지금의 차이만큼 날짜를 밀어 「3분 전」·「진행 중」이 유지된다.
- 뮤테이션은 운영으로 절대 넘기지 않는다(게스트 생성·조회수 부작용) — `MUTATIONS` 표 또는 null.
- 녹화는 인증 없이 — 공개 데이터만 들어간다. 토큰·이메일 모양 값은 지우고, 긴 목록은 60개로 자른다(녹화 파일은 커밋된다).
- 시나리오: `empty`(객체 배열 전부 비움)·`error`(모든 쿼리 errors). 화면마다 하네스가 `POST /__scenario` 로 바꾼다.
- 녹화보다 더 스크롤해 부른 다음 쪽은 «목록 끝»으로 답한다.
- 날짜 값만 다른 쿼리(«N일 전 자정» startDate 등)는 날짜가 가장 가까운 녹화로 답한다(`sameExceptDates`) — 날이 바뀌어도 재생이 깨지지 않게.
- 날마다 돌려 고르는 섹션(커뮤니티 위 핫딜 후보 4개)은 `screens:record` 가 web 서버·브라우저 시계를 1~3일 뒤로 옮겨(`pin-clock.cjs`,
  `SCREENS_PIN_DAYS`) 다른 날 몫을 덧붙여 녹화한다(`SCREENS_RECORD_APPEND=1`). 재생은 시계를 건드리지 않는다 — Date 만 옮기면
  Next 캐시가 쓰는 다른 시계와 어긋나 에러 시나리오 응답이 다음 화면에 섞였다(운영 빌드).
- 앱 하네스(`apps/mobile/scripts/screens-ios.sh`, `SCREENS_API=fixture`)도 같은 서버를 쓴다 — 녹화 폴더만 `SCREENS_FIXTURES_DIR=apps/mobile/screens-fixtures`
  (녹화는 폴더를 통째로 비우므로 web 과 따로). 앱은 저장소 키 `jirum:screens-api-url` 로 주소를 받고(localhost 만), 첫 실행 게스트 생성·토큰 갱신엔
  JWT 모양 `GUEST_TOKEN` 을 주며 `SCREENS_GUEST_AS_USER=1` 이라 그 토큰도 로그인 데이터(`user-fixtures.ts`, 앱 오퍼레이션 이름 포함)로 답한다.

## 화면 추가

`pages.ts` 에 한 줄(`states` = 빈·에러도 찍기, `desktop` = PC 레이아웃이 따로 있음) → `screens:record` → `screens`.
로그인한 화면은 `auth: 'user'` — 하네스가 `ACCESS_TOKEN` 쿠키에 `USER_TOKEN` 을 심고, 고정 데이터 서버는 그 토큰이 오면
`user-fixtures.ts`(생성 타입으로 쓴 손 데이터: me·내 키워드·알림함·찜·알림 설정…)부터 찾는다. 녹화는 비로그인이라 이런 쿼리는
FORBIDDEN 으로만 남는다 — 새 로그인 화면이 «로그인 데이터 없음»으로 막히면 그 오퍼레이션을 `user-fixtures.ts` 에 추가한다.
