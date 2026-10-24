/**
 * 상품 카드 클릭의 진입 경로(source) — web(GTM data-source → GA4 select_item)·앱(GA4 product_card_click)이 같은 값을 보낸다.
 * ⚠️값은 한 글자도 갈리면 안 된다(GA4 리포트에서 다른 경로로 갈린다). 한쪽에만 있는 경로도 여기 하나에 모은다.
 * snake_case (기존 이벤트 네이밍 컨벤션 일치).
 */
export type ProductCardSource =
  | 'home_ranking' // 홈 지름 랭킹 슬라이더
  | 'home_promotion' // 홈 프로모션 섹션 (grid/carousel/double_row/list)
  | 'search' // 검색 결과
  | 'search_recommend' // 검색 초기 추천 캐러셀
  | 'ranking_tab' // 트렌딩 랭킹 그리드 (기존 추적과 동일 명칭)
  | 'trending_live' // 트렌딩 실시간 핫딜 캐러셀
  | 'hot_feed' // 발견 탭 「최신」 핫딜만 켬(서버 hotDealFeedProducts)
  | 'live_tab' // 발견 탭 「최신」 핫딜만 끔(올라온 딜 전부 최신순) — 앱은 전부터 이 값으로 노출을 보냈다
  | 'trending_recommend' // 트렌딩 추천 핫딜 캐러셀
  | 'wishlist' // 찜 목록
  | 'related' // 관련 상품
  | 'keyword_recommend' // 키워드 추천
  | 'together_viewed' // 함께 본 상품
  | 'category_popular' // 카테고리 인기
  | 'notification_theme' // 알림 묶음 상세 라이브딜
  | 'keyword_hub' // 키워드 허브 화면 목록(지금은 앱만 — web 허브 그리드는 아직 source 를 안 붙인다)
  | 'keyword_tab' // 키워드 탭 «내 키워드» 카드의 최근 딜(web /keywords·앱 KeywordsTab)
  | 'expired_latest' // 종료 딜 상세의 '최신 핫딜' 블록(지금은 web 만)
  | 'live_alternative' // 진행 중 딜 상세의 '다른 곳 진행 중인 딜' 블록
  | 'toss_internal_link' // 토스 상세의 '토스에서 함께 보는 상품'(실험 toss_internal_link_v1, web 만)
  | 'season_hub'; // 해외직구 시즌 허브(/season/2026-black-friday)의 직구 딜(web 만)
