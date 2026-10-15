# js-patches/

node_modules 패키지의 **JS 파일**만 고치는 패치. `postinstall` 의 `scripts/apply-js-patches.mjs` 가 적용한다
(왜 pnpm patchedDependencies·patch-package 의 `patches/` 가 아닌지는 그 스크립트 머리 주석).
JS 라 OTA 로 나가고 네이티브 지문과 무관하다 — 네이티브 파일을 고치는 패치는 여기 두지 않는다(스크립트가 거부).

- 파일 이름 `<패키지>@<버전>.patch`(경로는 패키지 루트 기준 `a/`·`b/`). 고친 파일마다 `[jirum patch]` 주석을 넣는다 — 적용 여부 표식.
- 버전에 묶여 있어서 그 패키지를 올리면 설치가 실패한다 — 새 버전 소스에 같은 수정이 아직 필요한지 보고 다시 만든다.
- 만드는 법: 원본 파일을 사본으로 떠 두고 고친 뒤 `git diff --no-index` → 경로 접두를 `a/`·`b/` 로.

## react-native@0.86.3 — 스와이프·키보드 뒤 첫 탭이 버려지던 것 (2026-10-16)

`Libraries/Components/ScrollView/ScrollView.js` 만 고친다(JS 라 OTA 로 나간다, 네이티브 지문 무관).

1. **관성 중 탭.** 원본은 관성 시작~끝 이벤트가 JS 에 도착할 때까지 모든 탭을 가로채 «스크롤 멈추기»로만
   썼다. 그래서 눈으로는 멈췄는데도 첫 탭이 버려졌다 — 스냅 캐러셀의 느린 꼬리, 안드로이드의 정지 판정
   (3프레임 더 지켜본 뒤 끝 이벤트), JS 가 밀려 끝 이벤트가 늦게 도착할 때(끝 받고 16ms 안의 탭도 가로챘다).
   iOS 는 탭으로 멈추면 끝 이벤트를 아예 안 보내 다음 탭들까지 버려질 수 있었다.
   → 최근 스크롤 속도(네이티브 타임스탬프)가 1px/ms 이상일 때만 가로챈다. 탭으로 멈추면 그 자리에서 관성을 끝낸다.
2. **키보드가 떠 있을 때 탭.** `keyboardShouldPersistTaps` 기본값 `'never'` 는 첫 탭을 키보드 내리기로만 썼다
   (검색 화면 안쪽 가로 칩 목록처럼 바깥만 `'handled'` 를 준 경우에도). → 지정 안 한 곳은 `'handled'`.
   빈 곳을 누르면 키보드는 그대로 내려간다.

검증: `apps/mobile/__tests__/scrollview-tap-while-scrolling.test.tsx`(패치 전 RN 으로 돌리면 5개 중 3개 실패).
RN 을 올릴 땐 `_handleStartShouldSetResponderCapture` 의 `_isAnimating()` 가로채기가 아직 있는지부터 본다.

실측(안드로이드 에뮬레이터, 홈 랭킹 슬라이더 스와이프 → 카드 탭, 8회씩): 0.3초 뒤 탭 3/8 → 7/8 열림, 0.6초 뒤 8/8 → 7/8.
스와이프 **직후**(카드가 아직 프레임당 20px 넘게 움직임)는 패치 전후 모두 0/8 — 안드로이드는 날아가는 중 터치를
네이티브 `HorizontalScrollView.onInterceptTouchEvent` 가 가로채 취소한다(JS 와 무관, 플랫폼 기본 동작). 1px/ms 기준은 이와 맞춘 것.
