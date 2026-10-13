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
/** 기기 허브(아이폰·갤럭시 등) 공통 — 액세서리·호환 충전기·통신사 대리점 광고글. */
const DEVICE_EXTRAS = [...ACCESSORY, '파우치', '충전기', '호환', '부가서비스'];
/** 사료·간식 — 참치·닭가슴살 허브에 고양이 캔이 섞였다. */
const PET = ['고양이', '강아지', '반려', '애견'];

// 제외어는 2026-10-14 운영 30일 실측으로 넣었다 — 허브별로 걸린 제목을 읽어 다른 상품만 골랐고,
// 제외어가 잘라내는 제목도 다시 읽어 진짜 상품이 빠지지 않는지 봤다(예: 휴지 313 → 163 은 휴지통·휴지걸이,
// 갤럭시 476 → 156 은 케이스·필름, 에어컨 82 → 19 는 필터·커버·세정제). 넣을 때도 같은 방법으로.
export const KEYWORD_HUBS: KeywordHub[] = [
  { slug: '삼다수', name: '삼다수' },
  { slug: '생수', name: '생수', excludes: ['위생수건', '인생수업'] },
  { slug: '탄산수', name: '탄산수', excludes: ['제조기'] },
  { slug: '콜라', name: '콜라', excludes: ['콜라겐', '콜라비', '콜라보', '앵콜'] },
  { slug: '펩시', name: '펩시', excludes: ['충전기'] },
  {
    slug: '커피',
    name: '커피',
    excludes: [
      '머신',
      '그라인더',
      '니들',
      '디스트리뷰터',
      '드리퍼',
      '템퍼',
      '커피포트',
      '커피잔',
      '유리컵',
      '롤케',
      '땅콩',
      '빵',
      '지갑',
      '동전',
    ],
  },
  { slug: '맥심', name: '맥심' },
  { slug: '메가커피', name: '메가커피', aliases: ['메가MGC', '메가 MGC'] },
  { slug: '햇반', name: '햇반' },
  { slug: '신라면', name: '신라면' },
  { slug: '참치', name: '참치', excludes: ['참치액', '묘설렘', ...PET] },
  { slug: '닭가슴살', name: '닭가슴살', excludes: ['습식', ...PET] },
  { slug: '삼겹살', name: '삼겹살', excludes: ['그릴팬'] },
  { slug: '족발', name: '족발' },
  {
    slug: '계란',
    name: '계란',
    aliases: ['달걀', '유정란'],
    excludes: ['과자', '빵', '김밥', '샐러드', '찜기', '보관', '트레이', '수세미'],
  },
  { slug: '두유', name: '두유', excludes: ['두유기', '제조기'] },
  { slug: '프로틴', name: '프로틴', excludes: ['샴푸', '트리트먼트', '헤어', '클리닉', '치즈'] },
  { slug: '기저귀', name: '기저귀', excludes: [...PET, '배변'] },
  { slug: '물티슈', name: '물티슈', excludes: ['케이스', '홀더'] },
  {
    slug: '휴지',
    name: '휴지',
    aliases: ['화장지'],
    excludes: ['휴지통', '휴지걸이', '휴지케이스', '홀더', '집게'],
  },
  { slug: '세제', name: '세제', excludes: ['보관함', '디스펜서', '정리대', '선반'] },
  {
    slug: '샴푸',
    name: '샴푸',
    excludes: ['샴푸솔', '브러시', '샴푸통', '리필용기', '샴푸의자', '염색', ...PET],
  },
  {
    slug: '건전지',
    name: '건전지',
    excludes: ['건전지식', '건전지형', '홀더', '양초', '캔들'],
  },
  { slug: '보조배터리', name: '보조배터리' },
  { slug: '선풍기', name: '선풍기', excludes: ['커버', '브러쉬', '청소'] },
  {
    slug: '에어컨',
    name: '에어컨',
    // 차량 에어컨 탈취제·세척제·리모컨·배관 테이프가 실제 에어컨 딜보다 많았다(10월 실측).
    excludes: [
      '커버',
      '필터',
      '세정제',
      '세척',
      '탈취',
      '청소',
      '냉각핀',
      '테이프',
      '리모컨',
      '멀티탭',
      '차량',
      '선풍기',
      '붙박이',
    ],
  },
  {
    slug: '냉장고',
    name: '냉장고',
    excludes: [
      '정리',
      '보관',
      '용기',
      '트레이',
      '채반',
      '선반',
      '시트',
      '물병',
      '디스펜서',
      '탈취',
      '자석',
      '마그넷',
      '바지',
      '멀티탭',
    ],
  },
  {
    slug: '노트북',
    name: '노트북',
    excludes: [
      '가방',
      '백팩',
      '파우치',
      '슬리브',
      '거치대',
      '스탠드',
      '받침',
      '쿨러',
      '케이스',
      '충전기',
      '이어폰',
      '스티커',
      '매트',
      '필름',
      '랜카드',
      '동글',
      '라이트',
    ],
  },
  {
    slug: 'ssd',
    name: 'SSD',
    excludes: ['케이스', '인클로저', '조립PC', '미니PC', '미니 PC', '노트북', '그램'],
  },
  {
    slug: '아이폰',
    name: '아이폰',
    excludes: [...DEVICE_EXTRAS, '보조배터리', '아이폰용', '즉시개통'],
  },
  {
    slug: '아이패드',
    name: '아이패드',
    excludes: [...DEVICE_EXTRAS, '펜슬', '키보드', '아이패드용', '숄더백'],
  },
  {
    slug: '에어팟',
    name: '에어팟',
    excludes: [...DEVICE_EXTRAS, '키링', '스티커', '홀더', '이어팁'],
  },
  { slug: '갤럭시', name: '갤럭시', excludes: [...DEVICE_EXTRAS, '터치펜', '소파'] },
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
  // 「기저귀 + 컬쳐랜드 5천원 증정」 같은 사은품 글을 뺀다.
  { slug: '컬쳐랜드', name: '컬쳐랜드', aliases: ['컬처랜드'], excludes: ['증정'] },
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

/** 「주로 올라오는 곳」에 이름을 올리는 최소 몫 — 한두 건짜리 곳까지 늘어놓지 않는다. */
const SOURCE_MIN_SHARE = 0.15;

export type KeywordHubRhythm = {
  /** 창(최근 N일) 안에서 이 키워드 딜이 하나라도 올라온 날 수(KST 날짜). */
  activeDays: number;
  windowDays: number;
  /** 많이 올라온 곳 최대 2곳(몫 15% 이상). */
  topSources: { name: string; share: number }[];
};

function kstDateKey(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/**
 * 이 키워드 핫딜이 얼마나 자주·어디에 올라오나. 가격은 쓰지 않는다(아래 buildKeywordHubSeo 주석 — 원값 오독).
 * 날짜·출처는 게시 시각·수집처라 틀릴 일이 없어 그대로 말해도 된다. 같은 딜을 여러 곳에 올려도
 * 「올라온 날」은 하루로 센다.
 */
export function summarizeKeywordHubRhythm(
  deals: HubDeal[],
  windowDays: number = KEYWORD_HUB_WINDOW_DAYS,
): KeywordHubRhythm {
  const days = new Set<string>();
  const sources = new Map<string, number>();
  for (const d of deals) {
    const posted = new Date(d.postedAt);
    if (!Number.isNaN(posted.getTime())) days.add(kstDateKey(posted));
    const name = d.provider?.nameKr?.trim();
    if (name) sources.set(name, (sources.get(name) ?? 0) + 1);
  }
  const total = deals.length;
  const topSources = [...sources.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name, count]) => ({ name, share: total ? count / total : 0 }))
    .filter((s) => s.share >= SOURCE_MIN_SHARE);
  return { activeDays: days.size, windowDays, topSources };
}

/** 「최근 30일 중 29일 올라왔어요」 + 빈도에 맞는 권유 한 줄. 딜이 없으면 null. */
export function describeKeywordHubRhythm(hubName: string, rhythm: KeywordHubRhythm) {
  if (rhythm.activeDays === 0) return null;
  const often = rhythm.activeDays >= Math.round(rhythm.windowDays * 0.7);
  return {
    headline: `최근 ${rhythm.windowDays}일 중 ${rhythm.activeDays}일 올라왔어요`,
    advice: often
      ? `${hubName} 핫딜은 거의 매일 올라와요. 급하지 않다면 알림을 걸어 두고 마음에 드는 딜을 골라도 돼요.`
      : `${hubName} 핫딜은 매일 올라오지는 않아요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.`,
    sources: rhythm.topSources.map((s) => `${s.name} ${Math.round(s.share * 100)}%`).join(' · '),
  };
}

function formatKstMonthDay(date: Date): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

/**
 * 허브 제목·설명. 최저가는 넣지 않는다 — 원값에 오독이 많다(삼다수 "4,320원"은 25,920원 딜을 잘못 읽은 값,
 * 2026-10-01 실측). 틀린 숫자가 검색결과에 박히느니 건수와 최근 딜만 쓴다.
 */
/** windowDays: 받은 딜이 실제로 덮는 기간 — 페이지 상한에 닿으면 30일보다 짧다(fetchKeywordHubDeals). */
export function buildKeywordHubSeo(
  hub: KeywordHub,
  deals: HubDeal[],
  windowDays: number = KEYWORD_HUB_WINDOW_DAYS,
) {
  const count = deals.length;
  const title =
    count > 0
      ? `${hub.name} 핫딜 모음 · 최근 ${windowDays}일 ${count}건 | 지름알림`
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
      ? `최근 ${windowDays}일 동안 커뮤니티·쇼핑몰 특가에 올라온 ${hub.name} 핫딜 ${count}건을 모았어요.${latestText}`
      : `커뮤니티·쇼핑몰 특가에 올라오는 ${hub.name} 핫딜을 모아 보여드려요.`;

  // 설명(검색결과 스니펫)엔 「며칠 올라왔나」를 덧붙인다 — 건수보다 「얼마나 자주」가 기다릴지 정하는 데 쓰인다.
  const rhythm = count > 0 ? summarizeKeywordHubRhythm(deals, windowDays) : null;
  const rhythmText = rhythm
    ? ` 최근 ${rhythm.windowDays}일 중 ${rhythm.activeDays}일 올라왔어요.`
    : '';

  return {
    title,
    lead,
    description: `${lead}${rhythmText} ${hub.name} 핫딜이 올라오면 바로 받아보게 키워드 알림도 걸어두세요.`,
    indexable: count >= KEYWORD_HUB_MIN_DEALS,
  };
}
