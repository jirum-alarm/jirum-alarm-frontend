# @jirum/design-tokens

지름알림 디자인 토큰의 **단일 출처(SSOT)**. 색·타이포 스케일·breakpoint·container·shadow를 한 곳(`tokens/primitive/*.json`)에만 정의하고, [Style Dictionary](https://styledictionary.com)로 각 플랫폼 생성물을 만든다.

> **정답 기준: Figma = web 값.** 토큰 hex는 Figma 스펙(= 전환 시점의 `apps/web` globals.css)과 일치한다.

## 왜 있나

이전엔 같은 팔레트가 web `globals.css`, mobile `tailwind.config.js`, admin `tailwind.config.ts`에 **각각 손으로** 적혀 있어 표류했다 (예: mobile `primary-600`이 `#7FC125`로 옛 값에 멈춤, web은 `#4ad11b`). 토큰 JSON 한 곳을 고치면 모든 앱이 따라오게 해서 이 표류를 **구조적으로 제거**한다.

## 구조

```
tokens/primitive/        ← 원시 토큰 (여기만 손으로 수정)
  color.json             ← primary/secondary/gray/error 10단계 + hotdeal-graph
  typography.json        ← Headline/28SB ~ Caption/12M 18종 + font weight/family
  dimension.json         ← breakpoint, container, text/leading 오버라이드
  shadow.json            ← shadow-small
build/                   ← 생성물 (커밋됨, 손대지 말 것)
  web.css                ← Tailwind v4 @theme + typography @utility → apps/web 이 @import
  tailwind.tokens.cjs    ← theme.extend 조각(colors + fontSize) → apps/mobile, admin 이 require (※ 아직 미연결)
  tokens.js / .d.ts      ← TS 상수
style-dictionary.config.js
scripts/verify-no-drift.mjs
```

## 사용

**토큰 바꾸기**: `tokens/primitive/*.json` 수정 → `pnpm --filter @jirum/design-tokens build` → 생성물 커밋.

**web** (연결됨): `apps/web/src/shared/style/globals.css` 가
```css
@import '@jirum/design-tokens/web.css';
```
로 색·스케일·shadow·typography를 받는다. globals.css의 `@theme`엔 앱 런타임 값(env() safe-area, `--font-pretendard`, `min()/100vw` 컨테이너)만 남는다.

typography는 `typography-<스타일>` **@utility 클래스**로 나온다 (size+leading+weight 묶음, fontFamily는 `var(--font-sans)` 참조):
```html
<h1 class="typography-headline-28sb">…</h1>
```

**mobile** (부분 연결): `tailwind.config.js`가 토큰과 hex가 **이미 동일한** 그룹만 연결했다 — `white`/`black`/`link`/`error`/`gray` (무손실). `primary`/`secondary`는 토큰과 틀어져 있어 하드코딩 유지 중 (아래 "틀어진 값" 표). typography(`tokens.fontSize`)는 아직 미연결.
```js
const tokens = require('@jirum/design-tokens/tailwind');
// colors: 동일 그룹만 tokens.colors.error / .gray / .white / .black / .link
// theme.extend.fontSize = tokens.fontSize  // text-headline-28sb 등 typography 14종 (v3 fontSize 맵) — 연결 시 활성
```

**admin** (미연결): TailAdmin 템플릿 기반(`primary: #3C50E0` 등)이라 토큰과 공유하는 팔레트가 없다. 토큰 연결 대상이 아니며, 통합하려면 디자인 체계 자체를 맞추는 별도 결정이 필요.

## 틀어진 값 — 디자이너 확인 후 연결 (별도 PR)

mobile이 토큰(Figma=web 값)과 **다른** 색. 연결하면 시각 변화가 생기므로 미연결로 둔다. 디자이너가 "Figma 값으로 통일" 확정하면 토큰 require로 전환.

**primary** (mobile이 옛 값에 멈춤):

| shade | mobile (현재) | token (Figma) |
| --- | --- | --- |
| 600 | `#7fc125` | `#4ad11b` |
| 700 | `#5f911c` | `#039100` |
| 800 | `#3f6112` | `#025900` |
| 900 | `#203009` | `#013200` |

**secondary** (미세 차이):

| shade | mobile (현재) | token (Figma) |
| --- | --- | --- |
| 50 | `#eff4ff` | `#f3f7ff` |
| 400 | `#6c97fa` | `#6593fd` |
| 500 | `#477df9` | `#467dfb` |

## drift 가드

```bash
pnpm --filter @jirum/design-tokens build   # 먼저 빌드
pnpm --filter @jirum/design-tokens verify  # 생성물이 토큰 JSON과 어긋나면 실패
```
CI/pre-commit에 넣으면 "토큰만 고치고 빌드 안 함" 또는 "생성물을 손으로 고침"을 차단한다.

## 아직 방출 안 하는 것 (컴포넌트 단계용)

- **hotdeal-graph** (`#ffc39c`/`#ff9651`/`#ff594d` 등) — 핫딜 강도 컴포넌트에서 시맨틱 토큰으로

토큰 JSON엔 이미 정의돼 있어 SSOT는 완전하다. 방출만 다음 단계에서 켠다.

> typography 14종은 이제 web.css(@utility)·tailwind.tokens.cjs(fontSize) 양쪽으로 방출된다.
> 아직 어느 앱도 소비하지 않으므로 시각 변화는 0 — 소비는 컴포넌트 단계에서 시작.
