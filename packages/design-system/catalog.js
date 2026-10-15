/**
 * 부품 카탈로그 — "이 화면에 필요한 조각이 이미 있나?"의 답. 새 화면은 여기서 골라 조립하고, 없을 때만 만든다.
 *
 * 한 줄 = 부품 하나. 기계가 읽는다:
 *   - 놀이터(apps/design)가 이 목록으로 「부품 지도」 페이지를 그린다.
 *   - 테스트(catalog.test.mjs)가 경로가 실제로 있는지, 레시피 이름이 recipes.js 에 있는지,
 *     web 부품이면 놀이터에서 만져 볼 스토리가 있는지 본다 — 부품을 만들고 등록을 빼먹으면 커밋이 막힌다.
 *
 * 필드
 *   id      고유 이름(레시피 이름과 같으면 같게)
 *   name    사람이 부르는 이름
 *   use     언제 쓰나 / 비슷한 것과 어떻게 가르나(한 줄)
 *   recipe  recipes.js 의 키(모양의 원본). 없으면 null(플랫폼마다 구현이 크게 다른 것)
 *   web     apps/web 의 구현 경로(폴더 또는 파일). 없으면 null
 *   app     apps/mobile 의 구현 경로. 없으면 null
 *   story   놀이터 스토리 제목(`components/Badge`). web 이 null 이면 레시피 갤러리 제목
 *
 * 경로는 레포 루트 기준. 레시피만 있고 컴포넌트가 없는 것(사진 틀·정보 상자 등)은 자리마다 클래스를 직접 읽는다.
 */

/** @typedef {{id: string, name: string, use: string, recipe: string | null, web: string | null, app: string | null, story: string}} CatalogEntry */

const W = 'apps/web/src/';
const A = 'apps/mobile/src/';

/** @type {CatalogEntry[]} */
const catalog = [
  // ── 누르는 것
  {
    id: 'button',
    name: '버튼',
    use: '동작 하나. lg = 화면 아래 주 버튼(가득), md·sm = 작은 버튼. 보조·위험·테두리는 tone',
    recipe: 'button',
    web: `${W}shared/ui/common/Button`,
    app: `${A}shared/components/ui/Button`,
    story: 'components/Button',
  },
  {
    id: 'chip',
    name: '고르는 칩',
    use: '필터·섹션 탭처럼 여러 개 중 고르기(테두리). 목록 전환은 탭, 다른 페이지로 가면 링크 칩',
    recipe: 'chip',
    web: `${W}shared/ui/common/Chip`,
    app: `${A}shared/components/ui/Chip`,
    story: 'components/Chip',
  },
  {
    id: 'tab',
    name: '채운 탭',
    use: '목록 전환(면을 채워 고른 것 표시). neutral·brand(라임)·segment(기간)',
    recipe: 'tab',
    web: null,
    app: `${A}shared/components/ui/TabPill`,
    story: '레시피/탭',
  },
  {
    id: 'toggle',
    name: '스위치',
    use: '켜고 끄기(알림 설정). 고르기는 칩, 여러 개 동의는 체크박스',
    recipe: 'toggle',
    web: `${W}shared/ui/common/Switch`,
    app: `${A}shared/components/ui/Switch`,
    story: 'components/Switch',
  },
  {
    id: 'linkChip',
    name: '링크 칩',
    use: '다른 페이지로 가는 칩 모양 링크(키워드 허브·관련 모델). web 만',
    recipe: 'linkChip',
    web: null,
    app: null,
    story: '레시피/칩 모양 링크·태그',
  },
  {
    id: 'keywordChip',
    name: '최근 검색어 칩',
    use: '눌러서 다시 검색 + ✕ 로 지우기',
    recipe: 'keywordChip',
    web: null,
    app: null,
    story: '레시피/칩 모양 링크·태그',
  },
  {
    id: 'addChip',
    name: '추천 키워드 칩',
    use: '눌러서 키워드 알림을 바로 등록(글자 뒤 +)',
    recipe: 'addChip',
    web: null,
    app: null,
    story: '레시피/칩 모양 링크·태그',
  },
  // ── 입력
  {
    id: 'input',
    name: '입력칸',
    use: '한 줄 입력(밑줄형). 도움말·오류 문구는 helperText·error',
    recipe: null,
    web: `${W}shared/ui/common/Input`,
    app: `${A}shared/components/ui/Text/TextField`,
    story: 'components/Input',
  },
  {
    id: 'select',
    name: '고르기 목록',
    use: '여러 값 중 하나(출생년도). 몇 개 안 되면 칩',
    recipe: null,
    web: `${W}shared/ui/common/Select`,
    app: null,
    story: 'components/Select',
  },
  // ── 라벨·표시
  {
    id: 'badge',
    name: '배지',
    use: '누를 수 없는 라벨(상태·판정·정보). 누르면 칩. 판정은 pill',
    recipe: 'badge',
    web: `${W}shared/ui/common/Badge`,
    app: `${A}shared/components/ui/Badge`,
    story: 'components/Badge',
  },
  {
    id: 'wordTag',
    name: '단어 태그',
    use: '누를 수 없는 단어 나열(관심사 키워드·제외어)과 「+N개 더 보기」',
    recipe: 'wordTag',
    web: null,
    app: null,
    story: '레시피/칩 모양 링크·태그',
  },
  {
    id: 'hotdealBadge',
    name: '핫딜 배지',
    use: '핫딜·대박·초대박 등급 표시(그라데이션 그림). 등급 기준은 @jirum/domain',
    recipe: null,
    web: `${W}shared/ui/HotdealBadge.tsx`,
    app: `${A}shared/components/product/HotdealBadge.tsx`,
    story: 'components/HotdealBadge',
  },
  {
    id: 'cardLabel',
    name: '카드 사진 위 상태',
    use: '상품 카드 사진 위 판매종료·베스트판매자·유통기한 띠. 카드 종류와 무관하게 이것만',
    recipe: 'cardLabel',
    web: `${W}entities/product-list/ui/ProductCardStatus.tsx`,
    app: `${A}shared/components/product/ProductCardStatus.tsx`,
    story: 'components/ProductCardStatus',
  },
  {
    id: 'cardThumb',
    name: '카드 사진 틀',
    use: '상품 카드 사진 자리의 옅은 면 + 테두리(사진이 늦어도 자리가 보이게)',
    recipe: 'cardThumb',
    web: null,
    app: null,
    story: '레시피/면·상자',
  },
  // ── 묶음·면
  {
    id: 'sectionTitle',
    name: '섹션 제목',
    use: 'page = 홈·목록 섹션(굵게, 더보기 자리), detail = 상세 안 섹션',
    recipe: 'sectionTitle',
    web: `${W}shared/ui/SectionHeader.tsx`,
    app: `${A}shared/components/ui/SectionHeader`,
    story: 'components/SectionHeader',
  },
  {
    id: 'infoBox',
    name: '정보 상자',
    use: '본문 안 옅은 면 + 테두리 상자(가격 판정 요약·공유 미리보기)',
    recipe: 'infoBox',
    web: null,
    app: null,
    story: '레시피/면·상자',
  },
  {
    id: 'detailInfo',
    name: '상세 정보 표',
    use: '상세의 쇼핑몰·가격 조건·혜택·배송비 줄(라벨 고정폭 왼쪽)',
    recipe: 'detailInfo',
    web: null,
    app: null,
    story: '레시피/면·상자',
  },
  {
    id: 'dealRow',
    name: '딜 줄',
    use: '같은 상품 다른 가격 목록의 한 줄. web 만',
    recipe: 'dealRow',
    web: null,
    app: null,
    story: '레시피/면·상자',
  },
  // ── 알림·겹침
  {
    id: 'toast',
    name: '토스트',
    use: '잠깐 뜨는 결과 알림(성공·실패·안내, 동작 버튼). 되돌릴 수 없는 확인은 확인 창',
    recipe: 'toast',
    web: `${W}shared/ui/common/Toast`,
    app: `${A}shared/components/AppToast.tsx`,
    story: 'components/Toast',
  },
  {
    id: 'confirm',
    name: '확인 창',
    use: '되돌릴 수 없는 동작 전에 한 번 묻기(삭제·로그아웃)',
    recipe: null,
    web: `${W}shared/ui/common/AlertDialog`,
    app: `${A}shared/components/ConfirmSheet.tsx`,
    story: 'components/AlertDialog',
  },
  {
    id: 'sheet',
    name: '바텀시트',
    use: '아래에서 올라오는 판(고르기·공유·설정). 겉(가림막·모서리·손잡이)만 공통, 안은 자리마다',
    recipe: 'sheet',
    web: `${W}shared/ui/common/BottomSheet`,
    app: `${A}shared/components/BottomSheet.tsx`,
    story: 'components/BottomSheet',
  },
  {
    id: 'tooltip',
    name: '툴팁',
    use: '아이콘 옆 짧은 설명(눌러서 열기). web 만',
    recipe: null,
    web: `${W}shared/ui/common/Tooltip`,
    app: null,
    story: 'components/Tooltip',
  },
  // ── 비었을 때·불러올 때
  {
    id: 'skeleton',
    name: '스켈레톤',
    use: '불러오는 동안의 자리표시 판. 크기·모서리는 실제 요소와 같게',
    recipe: 'skeleton',
    web: `${W}shared/ui/common/Skeleton`,
    app: `${A}shared/components/Skeletons.tsx`,
    story: 'components/Skeleton',
  },
  {
    id: 'emptyText',
    name: '빈 목록 한 줄 안내',
    use: '목록이 비었을 때 한 줄. 그림·큰 제목이 있는 빈 화면은 화면별',
    recipe: 'emptyText',
    web: null,
    app: null,
    story: '레시피/면·상자',
  },
];

module.exports = {catalog};
