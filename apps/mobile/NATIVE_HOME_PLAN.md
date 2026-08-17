# 홈 네이티브 전환 계획

현재 홈은 `TabWebView` — `SERVICE_URL + '/'` 를 웹뷰로 띄운다.
상세(`NATIVE_DETAIL_PLAN.md`)와 같은 방식으로 네이티브로 바꾸되, 웹뷰는 폴백으로 남긴다.

---

## 0. 결론부터

> **전제 (2026-08-17 사용자 확인)**
> — **자체 광고 슬롯(`HomeCarouselBanner`)은 유지한다.** 노출·클릭 집계까지 포팅.
> — 애드센스는 홈에 **원래 없다**(상세·검색에만 있음). "애드센스는 안 가져간다"는
>   조건은 자동 충족 — 홈 작업에 영향 없음.

**캐러셀에 라이브러리를 쓰지 않는다** — swiper 옵션이 `FlatList` 에 1:1 대응한다(§4).
단 배너 캐러셀(loop + autoplay)만 예외 검토 대상(§4.4).

### 규모 (실측)

| 항목 | 값 |
| --- | --- |
| 포팅 대상 | **~5,600 LOC / ~85 파일** (생성 코드·미사용 배럴 제외) |
| 그 중 실제 UI `.tsx` | ~4,770 LOC / 71 파일 |
| 데스크톱 분기 삭제로 감소 | 파일 통째 ~440 LOC + 공유 파일의 `pc:` JSX 상당수 |
| 상세 포팅 대비 | 4,800 LOC → **비슷한 규모** |
| 예상 | **3~4주** (상세가 ~25커밋, 그 중 14개가 후속 fix) |

> ⚠️ 초기에 "홈 ~2,400줄"로 봤던 건 `widgets/home` 만 센 오판이다.
> SDUI 말단 카드가 `entities/product-list`(17파일), 배너가 `features/banner`(9파일)에 있다.

---

## 1. 하위호환 — 탭 컴포넌트 교체 하나

홈 탭은 `createTabStack(tabNavigations.HOME)` 이 만드는 스택의 루트다.
`TabStackNavigator` 에서 루트 화면만 갈아끼운다.

```ts
// src/navigations/tab/TabStackNavigator.tsx
component={NATIVE_HOME && tabName === tabNavigations.HOME ? HomeScreen : TabWebView}
```

**하위호환 보장**

1. 상세 push 경로(`getPushablePath`)는 그대로 — 네이티브 홈에서 카드를 탭하면
   기존 `navigation.push(DETAIL, {path})` 를 그대로 호출한다
2. 홈이 아닌 4개 탭은 웹뷰 유지 → 영향 0
3. 빌드 스위치 1줄 롤백

> ⚠️ OTA 없음(`mobile-no-ota-store-review-required`). 원격 킬스위치가 아니라
> 빌드 스위치다. 단계별로 나눠 낼 것.

### ★ 웹뷰 주입 스크립트와의 충돌 점검

`TabWebView` 가 홈 웹뷰에 주입하던 것들이 네이티브에선 갈 곳을 잃는다:

| 주입물 | 네이티브 홈에서 |
| --- | --- |
| `buildNativeTabsInjectJs` (하단 여백·탭바 변수) | 불필요 — `useSafeAreaInsets` |
| `DEVICE_ID_SYNC_SCRIPT` | **확인 필요** — 홈에서만 동기화되면 끊긴다 |
| `INTERCEPT_DETAIL_LINK_SCRIPT` | 불필요 — 네이티브 카드가 직접 push |
| `handleScrollForHomeStatusBar` (스크롤 100px 기준 상태바 반전) | **직접 배선 필요**(§5-6) |

---

## 2. 데이터 — 상세에서 깔아둔 것 재사용

| 항목 | 상태 |
| --- | --- |
| GraphQL 클라이언트 | `shared/lib/client/http-client.ts` ✅ |
| codegen | `codegen.ts` (커밋된 `schema.graphql`) ✅ |
| react-query | `provider/ReactQueryProvider.tsx` ✅ |
| 카드 컴포넌트 | `shared/components/product/*` (404 LOC) ✅ |
| 카테고리 아이콘 | 11종 ✅ |
| 캐러셀 | `ProductCarouselSection.tsx` — swiper→FlatList 매핑 검증됨 ✅ |

### 스키마 확인 (선행)

홈이 쓰는 오퍼레이션 **16개** 중 mobile `schema.graphql` 커버리지를 먼저 실측할 것.
상세 때 `ProductOutput` 필드 5개가 빠져 있었다 — 같은 함정.

```
GRAPHQL_SCHEMA_URL=https://jirum-alarm.com/api/graphql pnpm generate:schema
```

> ⚠️ 런타임은 `jirum-api.kyojs.com/graphql`, 스키마는 `jirum-alarm.com/api/graphql`.
> 같은 백엔드인지 확인 후 갱신, diff 눈으로 검토.

### 필요한 오퍼레이션 16개

**신규 작성 (홈 섹션):**
`QueryHotDealRankingProducts` · `QueryGuestRecommendedHotDeals` · `QueryProductsByKeyword`
· `QueryProducts` · `QueryExpiringSoonHotDealProducts` · `QueryCommunityProviders`
· `QueryMallGroups` · `QueryRecommendedNotificationKeywords`
· `QueryTossCategoryLabels` · `QueryTossProducts`

**광고 (유지 결정):**
`ActiveAds` · `RecordAdImpressions` · `RecordAdClick`

**이미 있음:** `MutationAddNotificationKeyword` ✅ · `MutationRecordProductImpressions`(상세에서 씀)
**삭제:** `MutationAddUserDevice` — 네이티브가 이미 FCM 소유(`useFCMTokenManager`)

---

## 3. SDUI — 이게 이 작업의 핵심 자산

홈 섹션 구성은 **서버가 주는 데이터**다. 레이아웃을 하드코딩하지 않는다.

```
getPromotionSections()  →  PromotionSection[]
  { id, title, type, dataSource: { queryName, variables }, tabs? }
```

네이티브는 같은 서술자를 소비한다. **섹션 추가/순서 변경에 앱 배포가 불필요** —
OTA 없는 이 앱에서 특히 값어치가 크다.

### 옮길 파일 2개 (합 122줄)

| web | LOC | 네이티브 |
| --- | --- | --- |
| `entities/promotion/lib/getPromotionQueryOptions.ts` | 41 | queryName 5종 → react-query options 매핑 |
| `widgets/home/ui/DynamicProductList.tsx` | 81 | type 6종 → 렌더러 switch |

### queryName 5종

| queryName | 쓰는 섹션 |
| --- | --- |
| `hotDealRankingProducts` | `hotdeal` 놓치면 아까운 핫딜 |
| `guestRecommendedHotDeals` | `guest-recommended` 내 취향 저격 (0건이면 섹션 숨김) |
| `productsByKeyword` | `under-10000`, `premium`, 탭 폴백 |
| `products` | `mall`/`community` 탭 |
| `expiringSoonHotDealProducts` | `impending` 유통기한 임박 |

### 레이아웃 type 6종 → 네이티브 렌더러

| type | 네이티브 | 카드 |
| --- | --- | --- |
| `GRID` | `FlatList numColumns={2}` | `ProductGridCard` |
| `PAGINATED_GRID` | 위 + 더보기 | `ProductGridCard` |
| `GRID_TABBED` | 위 + 상단 탭 | `ProductGridCard` |
| `HORIZONTAL_SCROLL` | 가로 `FlatList` | `CarouselProductCard` |
| `DOUBLE_ROW` | 가로 `FlatList` + 2개씩 청킹(§4.2) | `DoubleRowProductCard` |
| `LIST` | 세로 `FlatList` | `ListProductCard` |
| `BANNER` | 타입 선언에만 있고 **미처리**(`return null`) — 포팅 불필요 | — |
| `GROUP` | 2열 배치(모바일은 세로 스택) | — |

### ★ 서버/클라 분리가 하나로 합쳐진다

지금은 탭 없는 섹션은 서버에서 페치(`DynamicProductSection`, async),
탭 있는 섹션만 클라(`TabbedDynamicProductSection`, `useSuspenseQuery`).
**RN 에선 전부 클라 단일 경로.** 이게 §5 의 주 작업.

---

## 4. 캐러셀 — 라이브러리 없이 간다

**swiper 11곳이라 겁먹었는데, 실측하니 종류는 3개뿐이다.**

### 4.1 가로 캐러셀 — `FlatList` 직결

`CarouselProductList.tsx` swiper 옵션 → RN 대응:

```
slidesPerView: 'auto'    → 카드가 자기 너비 가짐 (RN 기본)
spaceBetween: 12         → ItemSeparatorComponent
slidesOffsetBefore: 20   → contentContainerStyle.paddingHorizontal: 20
preventClicks            → 불필요 (RN 제스처가 탭/스크롤 자동 구분)
edgeSwipeThreshold: 100  → 불필요
```

`ProductCarouselSection.tsx` 에 이 매핑이 이미 있고 상세에서 검증됨 — **재사용**.

`nested`(중첩 스와이프 시 부모 잠금)는 홈에서 기본값 false — **포팅 불필요**.

### 4.2 2행 캐러셀 — 같은 FlatList + 청킹

> ⚠️ 초기에 "swiper `grid:{rows:2}` 모드라 가장 어렵다"고 했는데 **틀렸다.**
> 실제로는 배열을 2개씩 chunk 로 묶어 한 슬라이드 안에 `flex-col` 로 쌓을 뿐이다
> (`DoubleRowCarouselProductList.tsx:41-47`). grid 모듈 미사용.

`pairedProducts` 청킹 6줄 그대로 복사 → 각 아이템을 세로 `View` 2개로 렌더. 끝.

### 4.3 랭킹 슬라이더 — `JirumRankingSlider` (206줄)

| web | 네이티브 |
| --- | --- |
| `swiper.realIndex` | `onViewableItemsChanged` |
| `getVisibleSlides()` (`shared/lib/utils/swiper.ts`) | `viewabilityConfig` — **유틸 삭제** |
| `slidePrev/slideNext` 화살표 | 데스크톱 전용 — **삭제** |
| `SliderDots` (45줄) | 인덱스로 직접 그림 |
| `jotai` 전역 atom 2개 | SSR 하이드레이션용 — `useState` 로 강등 |

광고 슬라이드 삽입 로직(`isActiveAdvertise`, `slideIndex` 보정 `i>=3 ? i+1 : i`)은
**Persil 하드코딩 배너**용이다. 자체 슬롯(`ActiveAds`)과 별개 — 기간 만료 배너라
포팅 시 제거 판단 필요(§6).

### 4.4 배너 캐러셀 — ★유일한 난관

`BannerSwiper.tsx` (227줄). 여기만 진짜 캐러셀 기능을 쓴다:

| 기능 | 난이도 |
| --- | --- |
| `loop: true` | 무한 루프 — FlatList 자작 시 가장 성가심 |
| `autoplay: {delay:5000}` + 슬라이드별 `data-swiper-autoplay="6000"` | 개별 지속시간 |
| `centeredSlides: true` | `snapToInterval` + 패딩 |
| `onAutoplayTimeLeft` → 진행바 | Reanimated 로 재작성 |

**결정 필요**: FlatList 자작 vs `react-native-reanimated-carousel` 도입.
자작이 ~120줄 예상. §7 에서 비교.

**유리한 점**: `device.isJirumAlarmApp` 분기가 **이미 있다** — 앱에선 앱다운로드 배너를
빼고 카톡/소개 링크만 3회 반복. 네이티브는 그 분기의 앱 쪽만 남기면 슬라이드 수가 준다.

---

## 5. 함정

1. **★async 서버 컴포넌트 6개가 진짜 난관** (swiper 아님)
   `page.tsx` · `(desktop-ready)/layout.tsx` · `HomeContainerV2` · `DynamicProductSection`
   · `desktop/JirumRankingContainer` · `mobile/JirumRankingContainer`
   전부 `prefetchQuery` + `dehydrate`/`HydrationBoundary`. RN 에선 plain `useQuery` 로
   **구조적으로 단순해지지만 6파일 전부 재작성**이다.
   홈은 첫 화면 → **빈 상태·스켈레톤 디자인이 다른 어디보다 중요**.

2. **`checkDevice()` 는 포팅이 아니라 삭제**
   `app/actions/agent.ts` (`'use server'` + `next/headers`)가 전체 모바일/데스크톱
   분기를 몬다. RN 에선 `isMobile` 이 상수 → `desktop/*` 4파일과 `pc:` 변형 ~40곳 소멸.

3. **`retry: false` 가 전역**
   `ReactQueryProvider` 가 재시도를 꺼놨다. 홈 섹션 쿼리에 `retry` 개별 지정.
   섹션이 7개라 하나만 튀어도 눈에 띈다.

4. **스크롤 성능 — 상세에 없던 문제**
   지금 카드는 RN 기본 `Image`, 리스트는 `FlatList`. 상세는 캐러셀 1개라 무사했지만
   홈은 섹션 7개 × 카드 다수. **`FlashList`/`expo-image` 도입을 여기서 재검토**.
   후속 fix 커밋이 여기 몰릴 것으로 예상.

5. **부분 적용이 버그로 읽힌다** (`partial-ui-rollout-reads-as-bug`)
   홈은 네이티브인데 발견/커뮤니티 탭은 웹뷰라 **같은 상품 카드가 두 벌**이 된다.
   가격·뱃지·시간 표기를 웹과 픽셀 단위로 맞출 것. 홈 카드 = 검색 카드 = 발견 카드.

6. **상태바 반전 배선이 끊긴다**
   `handleScrollForHomeStatusBar` — 홈 웹뷰에서 스크롤 100px 넘으면 상태바를
   dark→light 로 뒤집는다. 네이티브 홈은 이 이벤트를 안 쏘므로 `onScroll` 로 직접 배선.
   안 하면 홈 상단 다크 헤더에서 상태바가 안 보인다.

7. **광고 노출 집계 — DOM 2개 대체 (유지 결정이라 필수)**
   - `useElementWidth` (`ResizeObserver` + `getBoundingClientRect`) → **`onLayout`**
     (RN 은 레이아웃 변경 시 재발화하므로 observer 불필요, 40줄 → ~10줄)
   - `AdvertiseBanner` 의 `useInView({threshold:0.5, triggerOnce:true})`
     → **`viewabilityConfig: {itemVisiblePercentThreshold: 50}`** + `onViewableItemsChanged`
     `triggerOnce` 는 `impressedCreativeIdRef` 가 이미 담당 → 그대로 복사
   **집계가 빠지면 광고 매출 측정이 조용히 죽는다.**

8. **`PromotionTabs` 의 `scrollIntoView`**
   활성 탭을 가운데로 스크롤(`PromotionTabs.tsx:18`) → `ScrollView.scrollTo` +
   `onLayout` 으로 오프셋 측정. 광고 블로커 제외하면 **남은 유일한 DOM 의존**.

9. **`nuqs` (URL 쿼리 상태)**
   `AddFCMToken.tsx` 에서 사용. RN 에 URL 없음 → 딥링크 파라미터 처리.
   단 `AddFCMToken` 자체가 삭제 대상(§2)이라 같이 소멸할 가능성.

10. **`motion/react` 17파일**
    거의 전부 `whileTap={{scale:0.95}}`. `motion/react-native` 타깃이 있거나
    `PressableScale`(이미 있음)로 대체. **기계적 작업**.

11. **`shared/ui/Link.tsx` 18줄이 초크포인트**
    `next/link` 래퍼를 카드 ~12개가 공유한다. 이거 하나만 RN 네비게이션으로
    바꾸면 하위가 전부 따라온다. **먼저 할 것.**

12. **`gray-400` 본문 텍스트 금지** (`gray-400-text-fails-wcag-aa`)
    대비 2.58:1 로 AA 미달. 보조 라벨은 `gray-500`.

13. **브랜드명은 "지름알림"** (`brand-name-is-jirum-alrim-not-alram`)

---

## 6. 안 옮기는 것

- **데스크톱 분기 전부** — `desktop/HeroSection`(15) · `desktop/Banner`(178) ·
  `desktop/JirumRankingContainer`(100) · `desktop/RankingSkeleton`(91) · `Footer`(55)
- **`BANNER` 섹션 타입** — 타입 선언에만 있고 렌더러가 `null` 반환
- **`SDUIHomeSection.bak`** — 죽은 파일, import 0
- **`AddFCMToken` / `fcmTokenAtom`** — 네이티브가 이미 FCM 소유
- **모달 인프라** — `FocusTrap`(155) · `Presence`(133) · `ScrollLock`(27) = RN 에서 무의미
- **`getVisibleSlides`** (`shared/lib/utils/swiper.ts`) — `viewabilityConfig` 로 대체
- **Persil 하드코딩 배너** — 기간 만료 판단 후 제거 (`Advertisement.Persil_20251124.isInPeriod()`)
- **애드센스** — 홈에 원래 없음(상세·검색 전용). 확인 완료, 작업 없음

---

## 7. 미해결 결정 1건

### 배너 캐러셀 (§4.4) — 자작 vs 라이브러리

| | FlatList 자작 | react-native-reanimated-carousel |
| --- | --- | --- |
| 신규 의존성 | 0 | 1 |
| 코드량 | ~120줄 | ~30줄 |
| loop + autoplay | 직접 구현 | 내장 |
| worklets 0.5.1 핀 환경 | ✅ 무관 | ⚠️ **버전 확인 필수** (victory-native 가 이래서 막혔음) |

**판단 보류.** 먼저 `device.isJirumAlarmApp` 분기로 앱에서 실제 몇 장이 뜨는지 세고,
2~3장이면 loop 없이 정적/단순 페이징으로 끝날 수 있다.

> 상세에서 차트·바텀시트 라이브러리를 둘 다 기각한 전례(§7·§9, NATIVE_DETAIL_PLAN)와
> 같은 기준: 라이브러리가 해주는 일을 우리가 실제로 쓰는지부터 센다.

---

## 8. 순서

0. **스키마 갱신** — 오퍼레이션 16개 커버리지 실측, diff 검토 후 커밋
1. **`shared/ui/Link` 대응 네이티브 래퍼** — 카드 12개가 여기 물림(함정 11)
2. **SDUI 뼈대** — `getPromotionQueryOptions`(41) + `DynamicProductList`(81) 이식.
   섹션 1종(`LIST`)만 먼저 그려 파이프 관통 확인
3. **카드 렌더러 4종** — `ProductGridCard` · `CarouselProductCard` ·
   `DoubleRowProductCard` · `ListProductCard`. 기존 `ProductCard` 재사용 최대화
4. **레이아웃 6종** — §3 표대로
5. **랭킹 슬라이더** (§4.3)
6. **광고 슬롯 + 노출/클릭 집계** (함정 7) — 매출 경로라 여기서 검증
7. **배너 캐러셀** (§4.4) — §7 결정 후
8. **상태바 반전·탭바 배선** (함정 6)
9. **스크롤 성능 실측** → `FlashList`/`expo-image` 판단 (함정 4)
10. `__tests__/home-sdui.test.ts` — queryName/type switch 매핑만 테스트

검증: `pnpm verify:migration` (generate + tsc + lint + jest + expo-doctor)

---

## 9. 참고 — 홈 이후

전체 전환 시 남는 4개 탭 (실측):

| 탭 | LOC | 라우트 | 쓰기 | 비고 |
| --- | ---: | ---: | --- | --- |
| 커뮤니티 | 2,878 | 3 | 7개 흐름 | vaul 4곳·파일업로드·`postContent.ts` 바이트 호환 필수 |
| 내정보 | 2,543 | **12** | 9개 모듈 | 넓고 얕음, 폼 8개 |
| 발견 | 2,022 | 2 | **없음** | swiper+radix+sticky 탭바, 읽기전용인데 재작성비 최고 |
| 알림 | 1,046 | 1 | 2개 | 가장 가벼움 |

권장 순서: **홈 → 알림 → 내정보 → 발견 → 커뮤니티**

### ★ 별건 버그 (포팅과 무관, 지금 고칠 수 있음)

`getTabNameFromUrl` 에 `/themes` 분기가 없어 HOME 으로 기본 처리된다
(`shared/lib/navigation/tab-routing.ts:38`). `/mypage/keyword` 에서 구독 테마를 누르면
내정보 탭 밖으로 튕긴다. 몇 줄로 수정 가능.
