/**
 * 키워드 허브(`/keywords/{키워드}`) — "삼다수 핫딜" 같은 검색어 그대로의 모음 페이지.
 *
 * 왜: 네이버 "X 핫딜" 질의 상위는 검색어 모양 허브를 가진 사이트다(덥석 `/keywords/신라면` 이 1위,
 * 2026-10-01 실측). 우리 모델 허브(`/deals/농심-신라면`)는 카탈로그 슬러그라 짧은 질의와 안 맞고,
 * 90일 동안 네이버 클릭 0건이었다. 노출 리포트상 의도어 검색 CTR 은 순수 상품명의 2배다.
 *
 * 목록은 화이트리스트다 — 목록 밖 키워드는 404. 아무 검색어나 열면 얇은 페이지가 무한히 생기고,
 * 네이버 스팸 정책(2026-07 "저품질 대량 생성")에 정면으로 걸린다. 고른 기준(2026-10-01 실측):
 * 알림 키워드 구독 상위 ∩ 최근 1년 커뮤니티 딜 20건 이상, 그리고 네이버 자동완성에 "X 핫딜" 수요가
 * 보이는 육아용품. 키워드 추가는 이 배열에 한 줄 — 넣기 전에 최근 30일 결과가 그 상품인지 확인할 것
 * (분유는 수요가 있어도 30일 결과가 분유포트·젖병뿐이라 뺐다).
 */
export type KeywordHub = {
  /** URL 세그먼트. 검색어 그대로(한글). */
  slug: string;
  /** 화면·제목에 쓰는 이름. 검색 API 질의어이기도 하다. */
  name: string;
  /** 제목에 이 중 하나가 있어도 같은 상품으로 친다(표기 흔들림). */
  aliases?: string[];
  /** 제목에 이게 있으면 뺀다(부분 문자열 오탐: 콜라→콜라겐, 기기→케이스). */
  excludes?: string[];
};

const ACCESSORY = ['케이스', '필름', '강화유리', '거치대', '케이블'];

export const KEYWORD_HUBS: KeywordHub[] = [
  { slug: '삼다수', name: '삼다수' },
  { slug: '생수', name: '생수' },
  { slug: '탄산수', name: '탄산수' },
  { slug: '콜라', name: '콜라', excludes: ['콜라겐'] },
  { slug: '펩시', name: '펩시' },
  { slug: '커피', name: '커피' },
  { slug: '맥심', name: '맥심' },
  { slug: '메가커피', name: '메가커피', aliases: ['메가MGC', '메가 MGC'] },
  { slug: '햇반', name: '햇반' },
  { slug: '신라면', name: '신라면' },
  { slug: '참치', name: '참치' },
  { slug: '닭가슴살', name: '닭가슴살' },
  { slug: '삼겹살', name: '삼겹살' },
  { slug: '족발', name: '족발' },
  { slug: '계란', name: '계란', aliases: ['달걀', '유정란'] },
  { slug: '두유', name: '두유' },
  { slug: '프로틴', name: '프로틴' },
  { slug: '기저귀', name: '기저귀' },
  { slug: '물티슈', name: '물티슈' },
  { slug: '휴지', name: '휴지', aliases: ['화장지'] },
  { slug: '세제', name: '세제' },
  { slug: '샴푸', name: '샴푸' },
  { slug: '건전지', name: '건전지' },
  { slug: '보조배터리', name: '보조배터리' },
  { slug: '선풍기', name: '선풍기' },
  { slug: '에어컨', name: '에어컨' },
  { slug: '냉장고', name: '냉장고' },
  { slug: '노트북', name: '노트북' },
  { slug: 'ssd', name: 'SSD' },
  { slug: '아이폰', name: '아이폰', excludes: ACCESSORY },
  { slug: '아이패드', name: '아이패드', excludes: ACCESSORY },
  { slug: '에어팟', name: '에어팟', excludes: ACCESSORY },
  { slug: '갤럭시', name: '갤럭시', excludes: ACCESSORY },
  {
    slug: '스위치2',
    name: '스위치2',
    aliases: ['스위치 2'],
    excludes: ['멀티탭', '콘센트', '전등'],
  },
  { slug: 'ps5', name: 'PS5', aliases: ['플스5', '플레이스테이션5'] },
  { slug: '독거미', name: '독거미' },
  { slug: '나이키', name: '나이키', aliases: ['NIKE'] },
  { slug: '문화상품권', name: '문화상품권' },
  { slug: '컬쳐랜드', name: '컬쳐랜드', aliases: ['컬처랜드'] },
];

/** 최근 이 기간의 딜만 허브에 싣는다. 제목의 "최근 N일 M건" 도 이 창이다. */
export const KEYWORD_HUB_WINDOW_DAYS = 30;
/** 이보다 적으면 noindex — 얇은 허브를 색인에 내지 않는다(링크는 따라가게 follow). */
export const KEYWORD_HUB_MIN_DEALS = 5;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

export function findKeywordHub(slug: string): KeywordHub | undefined {
  const key = norm(slug);
  return KEYWORD_HUBS.find((h) => norm(h.slug) === key);
}

/**
 * 제목이 이 허브의 상품인가. 검색 API 는 동의어까지 넓혀 돌려준다(햇반→컵밥, 에어팟→에어프라이팟 —
 * 2026-10-01 실측 상위 50건 중 절반) — 허브엔 제목에 키워드가 실제로 있는 딜만 싣는다.
 */
export function matchesKeywordHub(title: string, hub: KeywordHub): boolean {
  const t = norm(title);
  if (hub.excludes?.some((x) => t.includes(norm(x)))) return false;
  return [hub.name, ...(hub.aliases ?? [])].some((term) => t.includes(norm(term)));
}

/** 상세 → 허브 링크용. 제목에 걸리는 허브(최대 n개, 목록 순서). */
export function findKeywordHubsForTitle(title: string, max = 2): KeywordHub[] {
  return KEYWORD_HUBS.filter((h) => matchesKeywordHub(title, h)).slice(0, max);
}

export function keywordHubPath(hub: KeywordHub): string {
  return `/keywords/${encodeURIComponent(hub.slug)}`;
}

type HubDeal = {
  title: string;
  price?: string | null;
  postedAt: string | Date;
  provider?: { nameKr?: string | null } | null;
};

function formatKstMonthDay(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

/**
 * 허브 제목·설명. 최저가는 넣지 않는다 — 원값에 오독이 많다(삼다수 "4,320원"은 25,920원 딜을 잘못 읽은 값,
 * 2026-10-01 실측). 틀린 숫자가 검색결과에 박히느니 건수와 최근 딜만 쓴다.
 */
export function buildKeywordHubSeo(hub: KeywordHub, deals: HubDeal[]) {
  const count = deals.length;
  const title =
    count > 0
      ? `${hub.name} 핫딜 모음 · 최근 ${KEYWORD_HUB_WINDOW_DAYS}일 ${count}건 | 지름알림`
      : `${hub.name} 핫딜 모음 | 지름알림`;

  const latest = deals[0];
  const latestText = latest
    ? (() => {
        const posted = new Date(latest.postedAt);
        const meta = [
          latest.provider?.nameKr?.trim(),
          Number.isNaN(posted.getTime()) ? null : formatKstMonthDay(posted),
        ]
          .filter(Boolean)
          .join(' · ');
        // 원문 제목에 가격이 이미 있으면("… 14,980원") 다시 붙이지 않는다.
        const price =
          latest.price && !latest.title.includes(latest.price.replace(/원$/, ''))
            ? ` ${latest.price}`
            : '';
        return ` 가장 최근 딜은 ${latest.title}${price}${meta ? `(${meta})` : ''}.`;
      })()
    : '';

  const lead =
    count > 0
      ? `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 동안 커뮤니티에 올라온 ${hub.name} 핫딜 ${count}건을 모았어요.${latestText}`
      : `커뮤니티에 올라오는 ${hub.name} 핫딜을 모아 보여드려요.`;

  return {
    title,
    lead,
    description: `${lead} ${hub.name} 핫딜이 올라오면 바로 받아보게 키워드 알림도 걸어두세요.`,
    indexable: count >= KEYWORD_HUB_MIN_DEALS,
  };
}
