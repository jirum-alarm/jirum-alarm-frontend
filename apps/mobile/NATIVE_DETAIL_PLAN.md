# 상품 상세 네이티브 전환 계획

현재 상세는 `ProductDetailWebViewScreen` — `SERVICE_URL + path` 를 WebView 로 띄운다.
이걸 네이티브 화면으로 바꾸되, **웹뷰 경로를 지우지 않고 남긴다.**

---

## 0. 결론부터

> **2026-08-12 방침 변경 (사용자 지시)**
> — **전면 네이티브로 간다.** 광고는 포팅하지 않고 **제거**한다.
> — 아래 "Phase 2 = 웹뷰로 남긴다" 판단은 광고 매출이 근거의 절반이었는데
>   그게 사라졌으므로 폐기. 웹뷰는 폴백 경로로만 남는다.

**차트는 라이브러리를 쓰지 않는다** — 실측 결과 손으로 옮기는 게 더 싸다(§7).

### 확정된 결정 (2026-08-12)

| # | 결정 | 내용 |
| --- | --- | --- |
| 1 | 광고 | **전부 제거** — 애드센스 + `AdvertiseSlotBanner`(자체 슬롯). `activeAds`·노출/클릭 집계 배선도 앱에선 안 만든다 |
| 2 | 바텀시트 | §9 비교 참조 |
| 3 | primary 색 | **web 램프를 정본으로 mobile tailwind 를 교정**(600 = `#4AD11B`). 근거 §10 |
| 4 | 최근 본 상품 | **네이티브(AsyncStorage)** 로 저장. 웹뷰 주입 안 함 |

전면 네이티브의 실제 병목은 차트가 아니라 **댓글 시스템**이다.

> ⚠️ 이전 판(내 첫 결론)은 `PriceHistorySection` 1,034줄을 보고 "단일 최대 항목"
> 이라 했는데 **줄 수만 보고 내린 오판**이었다. 내용을 실측하니 가장 싼 축에 속한다.
> 근거는 §7.

---

## 1. 하위호환 — 스위치 하나로 끝난다

지금 상세로 들어가는 길은 **단 하나뿐이다**. 이게 이 작업이 안전한 이유다.

```
apps/mobile/src/screens/tabs/TabWebView.tsx:96
  navigation.push(tabStackNavigations.DETAIL, {path: pushablePath});
```

- 경로 판정: `getPushablePath()` — `/^\/products\/\d+(\/|$)/`
- 파라미터: `{path: string}` 하나 (`tab/types.ts`)
- 푸시 지점: 위 1곳. 딥링크는 상세를 push 하지 않고 웹뷰에 `location.href` 를 주입하므로
  (`useNotificationDeepLink.ts`) **이 작업의 영향권 밖이다.**

### 스위치

`TabStackParamList` 에 `path` 를 **그대로 두고**, DETAIL 화면 컴포넌트만 갈아끼운다.

```ts
// src/navigations/tab/TabStackNavigator.tsx
component={NATIVE_DETAIL ? ProductDetailScreen : ProductDetailWebViewScreen}
```

```ts
// src/screens/detail/ProductDetailScreen.tsx
const id = route.params.path.match(/^\/products\/(\d+)/)?.[1];
// 상세 본체가 아닌 하위 경로(/products/123/comment)거나 파싱 실패 → 웹뷰로 폴백
if (!id || !/^\/products\/\d+\/?$/.test(pathname)) {
  return <ProductDetailWebViewScreen route={route} />;
}
```

**하위호환 3중 보장**

1. `path` 파라미터 시그니처 불변 → 호출부 수정 0줄
2. `/products/123/comment` 등 하위 경로는 웹뷰로 폴백 → 라우팅 구멍 없음
3. `NATIVE_DETAIL` 플래그 → 앱 심사 없이 되돌릴 수는 없지만(OTA 없음),
   빌드 시점 롤백은 1줄

> ⚠️ OTA 가 없다(`mobile-no-ota-store-review-required`). 플래그는 원격 킬스위치가
> 아니라 빌드 스위치다. 그래서 더더욱 단계별로 나눠서 낸다.

---

## 2. 데이터 — 이미 다 깔려 있다

새로 만들 인프라가 사실상 없다. 확인한 것:

| 항목 | 상태 |
| --- | --- |
| GraphQL 클라이언트 | `shared/lib/client/http-client.ts` — `HttpClient.withAccessToken()`, 토큰 자동 첨부 |
| codegen | `codegen.ts` (커밋된 `schema.graphql` 읽음, 네트워크 안 탐) |
| react-query | `provider/ReactQueryProvider.tsx` |
| 로그인 상태 | `shared/hooks/useAuth.ts` |
| SVG | `react-native-svg` 15.12.1 설치됨 |
| NativeWind | 4.2.2 + `tailwind.config.js` |

### 스키마 커버리지 (실측)

`apps/mobile/schema.graphql` 의 Query 루트에 상세가 쓰는 것 **전부 있음**:

```
product(id: Int!)                     ✅
productGuides(productId: Int!)        ✅
comments(...)                         ✅
togetherViewedProducts(...)           ✅
categorizedReactionKeywords(id: Int!) ✅
```

`ProductOutput` 도 풍부하다 — `price / title / detailUrl / isEnd / hotDealType /
mallName / postedAt / uploaderType / author / content / isProfitUrl /
likeCount / isMyLike / commentSummary / hotDealIndex` 전부 존재.

### ⚠️ 단 `ProductOutput` 필드는 뒤처져 있다 — 스키마 갱신이 **선행 필수**

Query 루트는 다 있지만 **필드 단위로 5개가 빠졌다**(실측):

```
profitLinkProvider  ❌   data(JSONObject)  ❌   priceComparison ❌
priceContext        ❌   priceCurrency     ❌
```

`data` 가 없는 게 특히 아프다 — 토스/오늘의집/네이버 블록이 전부 `product.data` 에서 온다.
`profitLinkProvider` 는 구매 클릭 추적에 쓴다.

**그래서 순서 1번은 스키마 갱신이다:**

```
GRAPHQL_SCHEMA_URL=https://jirum-alarm.com/api/graphql pnpm generate:schema
```

운영 API 를 물으므로 커밋 diff 를 반드시 눈으로 확인할 것.
(빠진 광고·어드민 op 20개도 같이 들어오는데, 상세에 광고를 안 넣으면 무해하다.)

> 🔎 확인 필요: 런타임 엔드포인트는 `jirum-api.kyojs.com/graphql`(`shared/constant/endpoint.ts`)
> 인데 스키마는 `jirum-alarm.com/api/graphql` 에서 받는다. 같은 백엔드가 맞는지
> 갱신 전에 한 번 확인. 다르면 생성된 타입이 런타임과 어긋난다.

### 작업

`src/graphql/product.ts` 신설 → `pnpm generate`.
codegen documents 글롭이 `./src/graphql/*.ts` 라 파일만 만들면 자동으로 잡힌다.

> ⚠️ web 의 `pnpm code-gen` 은 오퍼레이션을 통째로 드롭하는 지뢰가 있지만
> (`web-codegen-blocked-both-schemas-stale`), **mobile 은 별개 config 라 무관**하다.
> mobile 은 커밋된 스키마를 읽어서 안전하다.

---

## 3. 옮기는 것 / 안 옮기는 것

### Phase 1 — 상단만 네이티브 (여기까지가 이득의 대부분)

| 웹 컴포넌트 | 네이티브 | 비고 |
| --- | --- | --- |
| `ProductDetailImage` | `<Image>` | aspect-square, sticky 는 버림 |
| `mobile/ProductInfo.tsx` (197줄) | `ProductInfo.tsx` | 뱃지·제목·가격·메타행 |
| `mobile/BottomCTA.tsx` (65줄) | `BottomCTA.tsx` | 구매 CTA + 좋아요 |

쿼리 1개(`product`)로 상단이 다 그려진다. 체감 이득이 가장 크고
(첫 페인트에 흰 화면 없음) 리스크가 가장 작은 구간.

**BottomCTA 주의**
- 웹은 `<a target="_blank">` → 네이티브는 `openInAppBrowser(product.detailUrl)`
  (`shared/lib/navigation` 에 이미 있음)
- `dataLayer.push` 는 GTM 이라 RN 에 없다 → `mixpanel.ts` 로 대체.
  **그냥 지우면 구매 클릭 추적이 사라진다** — 수익 지표라 반드시 갈아끼울 것.
- 하단 safe-area 는 `useSafeAreaInsets()`

### Phase 2 — 아래 절반은 웹뷰로 남긴다

상단 네이티브 + 그 아래 **웹뷰 한 장**을 이어 붙인다.
`/products/123?embed=below` 같은 파라미터로 웹이 상단을 숨기고 렌더.

이렇게 남기는 것:

| 블록 | 왜 안 옮기나 |
| --- | --- |
| `ProductDetailAd`, `AdvertiseSlotBanner` | 애드센스 스크립트 = 웹 전용. 옮기면 매출 손실 |
| `CommentSection` | 트리가 제일 크고(12개 파일) 입력·수정·신고·메뉴까지 딸림. 웹과 갈라지면 유지보수 2배 |
| `TogetherViewedSection`, `CategoryPopularByProductSection` | 카드 UI 를 통째로 새로 만들어야 함. 앱에 네이티브 카드가 **현재 0개** |
| `PriceHistorySection` | **1,034줄.** 차트 라이브러리가 아니라 손수 짠 SVG + `getBoundingClientRect()` 히트테스트다. 기하 계산은 1:1 이식되지만 좌표 측정·터치 매핑은 전부 새로 짜야 함. 축 로직도 미묘(`pricetrend-axis-minmax-beats-quantile`). 단일 최대 항목 |
| `CommunityReaction` | `motion/react` 애니메이션 의존 |

> 앱에 네이티브 리스트/카드 UI 가 하나도 없다는 게 핵심 제약이다.
> 인증 화면 빼면 전부 웹뷰다. 카드를 새로 만드는 순간 웹 카드와 두 벌이 된다
> (`web-vs-app-bottom-nav-two-implementations` 와 같은 함정).

**Phase 2 는 실제로 착수 전에 다시 판단할 것.** Phase 1 만으로 체감이 충분하면
거기서 멈추는 게 맞다.

---

## 4. 함정

1. **부분 적용이 버그로 읽힌다** (`partial-ui-rollout-reads-as-bug`)
   같은 상품이 홈(웹뷰 카드)과 상세(네이티브)에서 다르게 보이면 사용자는 버그로 읽는다.
   상단 네이티브의 가격·뱃지 표기는 **웹과 픽셀 단위로 맞출 것**.

2. **색 토큰**
   `shared/constant/colors.ts` 와 web 토큰이 별개다. `gray-400` 을 본문 텍스트에
   쓰면 대비 2.58:1 로 AA 미달(`gray-400-text-fails-wcag-aa`). 보조 라벨은 `gray-500`.
   — 웹 `ProductInfo` 가 지금 `text-gray-400` 을 라벨에 쓰고 있는데, 그대로 베끼지 말 것.

3. **브랜드명은 "지름알림"** (알람 아님, `brand-name-is-jirum-alrim-not-alram`)

4. **최근 본 상품**
   웹은 `pushRecentViewedProduct()` 를 localStorage 에 쓴다. 네이티브 상단으로 옮기면
   이 기록이 끊겨서 **웹뷰 홈의 "최근 본 상품"이 빈다.** AsyncStorage 로 옮기든,
   웹뷰에 주입하든 결정 필요. 안 하면 조용히 기능 하나가 죽는다.

5. **조회수(`ViewerCount`)**
   상단이 네이티브가 되면 웹의 조회 기록 호출도 같이 빠진다. 랭킹이 조회수를 먹으므로
   (`ranking-viewweight-vs-profitlink-bias`) 네이티브에서 같은 뮤테이션을 쏴야 한다.
   **이건 빠뜨리면 랭킹이 조용히 왜곡된다.**

6. **★FCM 딥링크가 iOS 에서 네이티브 상세를 안 띄운다**
   푸시는 `webviewRef.injectJavaScript("location.href=...")` 로 동작한다
   (`useNotificationDeepLink.ts`). 이게 다시 `TabWebView` 의 URL 필터로 들어가는데,
   그 필터엔 게이트가 있다:
   ```ts
   const isUserInitiated = Platform.OS !== 'ios' || event.navigationType === 'click';
   ```
   주입된 이동은 iOS 에서 `'click'` 이 아니다 → **푸시로 들어오면 네이티브 상세가 아니라
   탭 웹뷰가 그냥 이동한다.** 안드로이드는 통과.
   → 푸시 경로는 URL 주입 대신 `navigation.push(DETAIL, {path})` 로 명시 분기할 것.
   푸시가 주 유입 경로라 이걸 놓치면 "네이티브로 바꿨는데 왜 그대로냐"가 된다.

7. **탭바 숨김이 네이티브에선 안 걸린다**
   지금은 `onNavigationStateChange` → `setTabBarVisible(isTabRootUrl(url))` 로 숨는다.
   네이티브 화면은 이 이벤트를 안 쏘므로 **focus 에서 `setTabBarVisible(false)`,
   blur 에서 복구를 직접 호출**해야 한다. 안 하면 탭바가 하단 CTA 를 덮는다.

8. **`retry: false` 가 전역**
   `ReactQueryProvider` 가 재시도를 꺼놨다. 네트워크가 한 번만 튀어도 상세가 즉시
   에러 화면이 된다. 상세 쿼리엔 `retry` 를 개별로 켜줄 것.

9. **primary 색이 두 벌로 어긋나 있다**
   `constant/colors.ts` 의 `PRIMARY_600 = #4AD11B` vs `tailwind.config.js` 의
   `primary.600 = #7FC125`. gray 는 일치. 어느 쪽이 정본인지 정하고 시작할 것.

---

## 5. 순서

0. **`pnpm generate:schema`** — 안 하면 `data`/`profitLinkProvider` 가 없어서 2번이 막힌다.
   런타임 엔드포인트와 동일 백엔드인지 먼저 확인, diff 눈으로 검토 후 커밋
1. `src/graphql/product.ts` + `pnpm generate` — 타입 확보
   (글롭이 `src/graphql/*.ts` **평면**이라 하위 폴더는 조용히 무시된다)
2. `entities/product/product.queries.ts` — react-query 옵션, `retry` 개별 지정
3. `ProductDetailScreen.tsx` — 상단 네이티브 + 폴백 분기, 아래는 웹뷰
4. `TabStackNavigator` 스위치 + 탭바 visibility focus/blur 배선
5. 조회수·최근본상품·구매클릭(mixpanel) 배선
6. FCM 딥링크를 `navigation.push` 로 분기 (함정 6)
7. `__tests__/product-detail-route.test.ts` — path→id 파싱과 폴백 분기만 테스트
   (기존 `tab-routing.test.ts` 옆에)

검증: `pnpm verify:migration` (generate + tsc + lint + jest + expo-doctor)

---

## 7. 가격 차트 — 라이브러리 없이 손으로 옮긴다

**결론: 새 의존성 0개. `react-native-svg` + `gesture-handler` (둘 다 이미 설치됨).**

### 왜 1,034줄이 무섭지 않은가 (실측)

| 항목 | 실측 | 의미 |
| --- | --- | --- |
| SVG 프리미티브 | `path`·`circle`·`line`·`text`·`linearGradient`·`stop`·`defs`·`g` **8종** | `react-native-svg` 에 **전부 있음**. `clipPath`·`foreignObject`·`image` 안 씀 |
| 기하 계산 `buildChartGeometry` | **103줄, DOM 참조 0** (`:355-457`) | 순수 함수 → **그대로 복사**. 축 로직 손 안 댐 |
| DOM 결합 | **1곳뿐** (`:769-774` `getBoundingClientRect`) | 5줄 교체 |

나머지 ~900줄은 기간 탭·빈 상태·딜 카드·포맷터 — **차트 라이브러리가 대신 못 해주는 일반 React** 다.

`buildChartGeometry` 안에 든 것 (전부 이식됨):
Catmull-Rom→베지어 스무딩, **Y축 최소 스팬 15% + 0 클램프**(음수가격 방지),
X축 버퍼 8%, Y틱 5개·X라벨 4개(마지막은 "오늘"), `shortWon` k표기.

### 바뀌는 것은 딱 두 seam

```ts
// 1) 좌표: getBoundingClientRect → onLayout + Gesture.Pan
//    RN 제스처의 x 는 이미 뷰 로컬이라 오히려 더 단순해진다
const plotX = (gestureX / layoutWidth) * 640;

// 2) 태그: <svg viewBox> → <Svg viewBox="0 0 640 260">
//    className 상속이 없으므로 fill/stroke 를 명시 prop 으로
```

`next/image`(딜 카드 썸네일)·`next/link`(모델페이지) 제거도 같이.

### 라이브러리를 기각한 이유

| 후보 | 기각 사유 |
| --- | --- |
| **victory-native** v41 | 표현력은 유일하게 충분. 그러나 **버전 교착으로 설치 불가**: Skia 2.10+ 가 `react-native-worklets >=0.7.0` 를 요구하는데 **이 앱은 0.5.1 에 핀**(Expo 54). 실측 확인함 |
| **gifted-charts** | Skia 불필요·활발하지만 **config 주도**라 데이터 좌표에 임의 자식을 못 넣음 → seed "이 상품" 마커와 클램프된 라벨 2줄이 갈 곳 없음. 결국 손으로 그림 |
| **wagmi-charts** | Reanimated 4 미지원, 유지보수가 **포크로 이동**(stonk-charts). 포크에 베팅은 안 함 |
| **react-native-graph** | 스파크라인 — 축·틱·주석 없음. 기능 미달 |

핵심: 이 차트의 값어치는 렌더러가 아니라 **도메인 수학 100줄**에 있고, 그건 어느 라이브러리도
대신 못 한다. 라이브러리를 넣어도 주석·마커는 결국 손으로 그려야 한다.

### 리스크 2개

1. **텍스트 메트릭 차이** — `react-native-svg` `<Text>` 는 브라우저 SVG 와 자간·정렬이 다르다.
   Y틱 우측정렬(`textAnchor="end"`, `pad.left-8`)과 seed 라벨 클램프는 **실기에서 눈으로
   튜닝**해야 한다. 좌측 패딩 44px 가 한글/`10.6k` 라벨에 빠듯할 수 있음
2. **hover 가 모바일에 없다** — `hoverIdx`/`selectedIdx` 두 상태를 그대로 옮기지 말고
   **드래그 스크럽 하나로 합칠 것**(pan 이 선택을 연속 갱신)

### 재검토 조건

차트가 2~3개로 늘거나, Expo 가 worklets ≥0.7 로 올리고 Skia 가 기본 템플릿에 들어오면
그때 victory-native 재고. 지금은 아니다.

---

## 8. 전면 네이티브 — 남은 덩어리 (실측)

총 **RN 파일 ~32개**. 차트가 풀렸으므로 실제 비용은 댓글에 있다.

### A. 댓글 — ~12파일, 최대 항목

**★이벤트 버스는 사실 지울 것이다 (겁먹을 필요 없음)**

`document.dispatchEvent` 3종(`comment-cancel/reply/update-event`, `CommentLayout.tsx:18-20`)이
무서워 보이지만, 실제로 나르는 상태는 **jotai atom 하나뿐**이다:

```ts
editingCommentAtom: { comment: TComment; status: 'reply' | 'update' } | null
// useComment.ts:17-20 · 핸들러 :47-55 는 딱 3줄짜리 set 뿐
```

버스가 존재하는 유일한 이유는 setter 를 `CommentAction`/`CommentMenu` 로 안 내려서다.
**RN 에선 버스를 통째로 삭제하고 store 를 직접 호출**하면 끝. 이벤트 에미터 불필요.
(jotai 는 RN 에서 그대로 동작하므로 atom 유지 가능)

**진짜 어려운 3가지**
1. **하단 고정 입력창** — `position:fixed` + 멀티라인 자동증가 + 답글/수정 배너 + 오토포커스.
   지금 포커스가 `setTimeout(1000)` 해킹(`useCommentInput.ts:64-69`)에 의존 →
   `react-native-keyboard-controller`(**이미 설치됨**) + `onContentSizeChange` 로 재작성
2. **바텀시트 메뉴** — `vaul` 은 웹 전용. `@gorhom/bottom-sheet` **신규 의존성 결정 필요**
   (또는 reanimated Modal 로 자작)
3. **낙관적 업데이트 부재** — 지금은 모든 뮤테이션이 무한리스트를 통째 `invalidateQueries`.
   RN FlatList 에선 스크롤 점프로 보인다. 포팅하면서 optimistic 추가 권장

**화면이 2개다** — 상세 안 미리보기(`CommentSection`, 페이지네이션 없음·`max-h-400` 클립)와
전용 댓글 페이지(`CommentLayout`, 무한스크롤). 후자는 **새 네비 라우트**가 필요하다.

페이지네이션은 커서 방식 — `searchAfter`(배열)를 마지막 행에서 꺼냄(`comment.queries.ts:39-42`).
`useInView` 센티넬 → FlatList `onEndReached` 로 교체.

### B. 상품 카드/캐러셀 — ~8파일

**캐러셀은 embla 가 아니라 `swiper`** (`CarouselProductList.tsx:6`).
설정(`slidesPerView:'auto'`, `spaceBetween:12`, `slidesOffsetBefore:20`)이
가로 `FlatList` 로 **1:1 대응**된다 — 캐러셀 자체는 쉽다.

시간은 **리프 컴포넌트**에 들어간다: `ProductThumbnail`(카테고리별 폴백),
`DisplayListPrice`, `DisplayProductSource`, `HotdealBadge`, `DisplayTime`.
`line-clamp-2` → `numberOfLines={2}` + 행 정렬용 고정 높이 필요.

> 상세 페이지의 nested 캐러셀 로직은 안 씀(`nested` 기본값 false) — 포팅 불필요.

### C. CommunityReaction — 199줄, medium

**애니메이션 블로커 없음.** `motion` 은 `whileTap` 하나뿐(`Pressable` 로 대체).
무거운 `ReactionChart`(SVG 게이지 1.5s 트윈)는 **이 페이지가 렌더하지 않는다** — 스킵 가능.
실제 렌더는 `Reactions.tsx`(49줄, 정적 아이콘 목록).

걸리는 것: `Tooltip` 의 `align`/`polygonOffset` 포지셔닝이 RN 에 없다 →
탭-투-오픈 팝오버로 바꾸거나 드롭.
순수 로직 `deal-status-reaction.ts` 는 그대로 복사.

### D. 나머지 블록

| 블록 | 줄 | 난이도 | 비고 |
| --- | --- | --- | --- |
| `ViewerCount` | 74 | **hard** | `position:sticky` + `useInView` + width `auto↔100%` **layout 애니메이션**. 이 페이지에서 RN 이식이 가장 껄끄러운 물건. **애니메이션 빼고 먼저 내보낼 것** |
| `TossDetailImages` | 15 | medium | 웹은 `<img className="w-full">` 한 줄이지만 RN `<Image>` 는 **명시 높이 필요** → `Image.getSize`/`onLoad` 로 비율 측정. 긴 CDN 이미지라 메모리·스크롤 비용 주의 |
| `ExpiredProductWarning` | 97 | medium | **두 번째 리스트 UI**(`ProductGridList`)를 끌고 옴 — B 가 커버 안 함. dayjs + 제목→키워드 정규식 |
| `CoupangPartnerGuide` | 24 | trivial | 조건부 정적 바 |
| `KakaoOpenChatPrompt` | 58 | trivial | 데이터 없음. `Linking.openURL`. 절반이 주석 |
| `NoticeProfitUrl` | 26 | trivial | 위의 역조건 |
| `FirstVisitAppAlertModal` | 133 | **삭제** | 웹 유저에게 앱 설치를 권하는 모달. 앱 안에선 이미 무효화됨 |

**범위 밖(오해 방지)**: `HotdealScore`·`PriceContextBadge` 는 이 페이지가 안 씀.
`ProductGuideMetaRows` 는 상단 블록(`ProductInfo`) 소속.

### GraphQL 오퍼레이션 — 전체 18개, 전부 스키마에 있음

`QueryMe` 만 이미 있고(`src/graphql/user.ts`) **나머지 17개는 새로 작성**.

쿼리: `ProductInfo` · `ProductAdditionalInfo` · `ProductStats` · `QueryCategorizedReactionKeywords`
· `togetherViewedProducts` · `QueryProducts` · `QueryProductPriceHistory` · `productGuides`
· `QueryReportUserNames` · `comments`

뮤테이션: `addComment` · `updateComment` · `removeComment` · `addUserLikeOrDislike`
· `reportExpiredProduct` (+ 선택: `collectProduct` · `recordProductImpressions`)

> ✅ 실측 확인: 뮤테이션 5종 전부 `apps/mobile/schema.graphql` 의 `Mutation` 타입에 존재.
> 웹의 `AddUserLikeOrDislike` 는 오퍼레이션 별칭이고 스키마 필드는 소문자
> `addUserLikeOrDislike`(`:84`) — 이름만 다르지 없는 게 아니다.

### 신규 의존성 결정 (1개)

- **바텀시트** — `@gorhom/bottom-sheet` 도입 vs reanimated 로 자작.
  댓글 메뉴(삭제/수정) 하나 때문이면 자작이 싸다. 다른 곳에도 시트가 필요해지면 도입.

---

## 9. 바텀시트 — 비교와 결론

**결론: 자작(RN `Modal` + reanimated). `@gorhom/bottom-sheet` 안 넣는다.**

### 실제 요구사항 (실측)

이 페이지에서 시트가 필요한 곳은 **`CommentMenu` 하나뿐**이다. 내용물은:

```
[수정하기]      ← 버튼 2개
[삭제하기]
```

드래그 스냅 포인트 없음. 스크롤 콘텐츠 없음. 키보드 상호작용 없음.
`vaul` 을 쓴 것도 웹에 마침 있어서지, 기능을 요구해서가 아니다.

### 비교

| | 자작 (Modal + reanimated) | @gorhom/bottom-sheet |
| --- | --- | --- |
| 신규 의존성 | **0** | 1 (+ `@gorhom/portal` 등 전이) |
| 코드량 | ~60줄 1파일 | ~15줄 (라이브러리가 나머지) |
| 필요한 기능 충족 | ✅ 슬라이드업·백드롭·탭닫기 | ✅ + 스냅·드래그·스크롤(**안 씀**) |
| RN 0.81 / New Arch | ✅ 코어 API 만 씀 | ⚠️ reanimated·gesture-handler 버전 민감. **worklets 0.5.1 핀 환경**이라 확인 필요 |
| 유지보수 부담 | 우리 코드 60줄 | 업그레이드마다 호환성 |

### 결정 근거

버튼 2개짜리 메뉴에 의존성을 넣는 건 §7 에서 차트 라이브러리를 기각한 것과 **같은 이유**로
기각된다 — 라이브러리가 해주는 일(스냅·드래그·스크롤)을 우리가 안 쓴다.
게다가 이 앱은 이미 worklets 0.5.1 에 핀돼 있어 reanimated 생태계 의존성 추가는
버전 리스크가 실재한다(victory-native 가 그래서 막혔다).

```tsx
// ponytail: 시트 = Modal + translateY 애니메이션. 스냅포인트 필요해지면 그때 gorhom.
<Modal transparent visible animationType="none" onRequestClose={close}>
  <Pressable style={backdrop} onPress={close} />
  <Animated.View style={[sheet, animatedStyle]}>{children}</Animated.View>
</Modal>
```

**재검토 조건**: 시트가 3곳 이상으로 늘거나, 스크롤·스냅·키보드 회피가 실제로 필요해지면 도입.

---

## 10. primary 색 — 실측으로 답이 나왔다

**결론: web 램프가 정본. mobile `tailwind.config.js` 의 primary 600~900 이 틀렸다.**

내가 앞서 "둘 중 뭘 고를지 정해달라"고 물었는데, **고르는 문제가 아니었다.**

### 근거 1 — `COLORS.PRIMARY_600` 은 아무도 안 쓴다

```
grep -rn "PRIMARY_600" src/  →  선언 1줄뿐, 사용처 0
```

`constant/colors.ts` 의 `#4AD11B` 는 죽은 상수다. 실제 UI 는 전부 tailwind 클래스
(`bg-primary-500` 등, `Button/variant/button.ts`)를 쓴다. 즉 **런타임 충돌은 없었다.**

### 근거 2 — 진짜 문제는 600 하나가 아니라 램프 절반이 어긋난 것

| 단계 | web (정본) | mobile | |
| --- | --- | --- | --- |
| 50~500 | `#F5FDEA`…`#9EF22E` | 동일 | ✅ |
| **600** | `#4AD11B` | `#7FC125` | ❌ |
| **700** | `#039100` | `#5F911C` | ❌ |
| **800** | `#025900` | `#3F6112` | ❌ |
| **900** | `#013200` | `#203009` | ❌ |

mobile 은 500 에서 **기계적으로 어둡게 보간한 값**이고, web 은 600 부터 채도를 꺾어
초록으로 보내는 **의도된 곡선**이다. 500 까지 완전히 일치한다는 건 mobile 이 web 에서
복사해오다 뒷부분을 생성기로 채웠다는 뜻.

### 조치

`apps/mobile/tailwind.config.js` 의 primary **600~900 을 web 값으로 교정**하고,
쓰지 않는 `COLORS.PRIMARY_600` 은 **삭제**한다.

> ⚠️ 교정하면 기존 네이티브 화면(로그인 등)에서 `primary-600↑` 를 쓰던 곳의 색이 바뀐다.
> 위 grep 상 현재 사용처는 `primary-500`/`300` 뿐이라 **영향 없을 것으로 보이나**,
> 교정 후 로그인·회원가입 화면을 눈으로 확인할 것.

---

## 6. 안 하는 것

- 상세 전체 네이티브화 — 광고·댓글은 웹뷰가 맞다
- 네이티브 상품 카드 컴포넌트 — Phase 2 로 미룸, 착수 전 재판단
- 딥링크 경로 변경 — 현재 웹뷰 주입 방식 그대로
- `path` 파라미터를 `{productId: number}` 로 바꾸기 — 호출부·폴백이 다 깨진다
