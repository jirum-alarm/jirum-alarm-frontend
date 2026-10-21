// 로그인한 화면용 고정 데이터. 녹화는 인증 없이 해서 me·알림함·내 키워드 같은 쿼리는 FORBIDDEN 으로만 남는다 —
// 그래서 여기서 손으로 만든다. 생성 타입(codegen)으로 적어 스키마가 바뀌면 tsc(-p screens)가 잡는다.
// 하네스는 USER_TOKEN 을 ACCESS_TOKEN 쿠키로 심고, 고정 데이터 서버는 그 토큰이 오면 여기부터 찾는다.
// 새 로그인 화면이 «로그인 데이터 없음»으로 막히면 그 오퍼레이션을 여기에 추가한다.
// 이 파일은 node(고정 데이터 서버, ESM)와 Playwright(CJS) 둘 다 읽는다 — fs·__dirname 같은 모듈 방식에 기대는 코드는 두지 않는다.
import type {
  QueryMeQuery,
  QueryMypageKeywordQuery,
  QueryNotificationsQuery,
  QueryUnreadNotificationsCountQuery,
  QueryWishlistCountQuery,
  QueryWishlistsQuery,
} from '../src/shared/api/gql/graphql';
// 앱(apps/mobile)은 같은 데이터를 다른 오퍼레이션 이름으로 부른다 — 앱 하네스(screens-ios.sh SCREENS_API=fixture)용.
import type {
  MyFavoriteCategoriesQuery,
  QueryMyNotificationKeywordsQuery,
  QueryMyProfileQuery,
  QueryMyPushSettingQuery,
} from '../../mobile/src/shared/api/gql/graphql';

export const USER_TOKEN = 'fixture-user-token';

// 첫 실행 게스트 생성(MutationGuestLogin)·토큰 갱신에 고정 데이터 서버가 주는 토큰. 앱은 access 토큰의 JWT exp 를 읽어
// 만료면 갱신을 기다리므로 JWT 모양(서명 없음, exp 2100년)이어야 한다. 앱 하네스(SCREENS_GUEST_AS_USER=1)에선 이 토큰도 로그인으로 본다.
// 문자열로 박지 않고 만든다 — JWT 모양 문자열은 비밀 스캐너(gitleaks)가 토큰으로 잡는다.
const b64url = (o: object) =>
  btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
export const GUEST_TOKEN = `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: 'fixture-guest', exp: 4102444800 })}.fixture`;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

// 녹화에 있던 공개 상품 몇 개(제목 길이·가격 자릿수가 제각각이라 줄바꿈·말줄임이 드러난다).
const PRODUCTS = [
  {
    id: '36102105',
    title: '맘스럽 워싱소다 버킷 5kg 탄산소다 100% 프리미엄 세탁세제 1등급품질 초강력 세탁보조제',
    price: '9,000원',
    thumbnail: 'https://cdn.jirum-alarm.com/community/coupanggoldbox/9700797458.webp',
    categoryId: 2,
    isHot: false,
  },
  {
    id: '36089133',
    title: '7800X3D 302,469원',
    price: '302,469원',
    thumbnail: null,
    categoryId: 1,
    isHot: true,
  },
  {
    id: '36099742',
    title: '딥큐 3in1 고농축 캡슐세제 오션브리즈 200개 X 2세트',
    price: '26,230원',
    thumbnail: null,
    categoryId: 2,
    isHot: false,
  },
];

const me = (): QueryMeQuery => ({
  me: {
    id: '1',
    email: 'user@example.com',
    nickname: '하네스사용자',
    birthYear: 1995,
    gender: null,
    favoriteCategories: [1, 2],
  },
});

const keywords = (): QueryMypageKeywordQuery => ({
  notificationKeywordsByMe: [
    { id: '1', keyword: '세제', priceDropOnly: false },
    { id: '2', keyword: '7800X3D', priceDropOnly: true },
    { id: '3', keyword: '아주 긴 키워드로 줄바꿈이 어떻게 되는지 보는 칸', priceDropOnly: false },
  ],
});

const notifications = (): QueryNotificationsQuery => ({
  notifications: PRODUCTS.map((p, i) => ({
    id: String(100 + i),
    readAt: i === 0 ? null : minutesAgo(5),
    createdAt: minutesAgo(10 + i * 90),
    title: p.title,
    message: p.title,
    url: `/products/${p.id}`,
    keyword: i === 1 ? '7800X3D' : '세제',
    product: {
      id: p.id,
      thumbnail: p.thumbnail,
      price: p.price,
      isHot: p.isHot,
      isEnd: i === 2,
      categoryId: p.categoryId,
    },
  })),
});

const wishlists = (): QueryWishlistsQuery => ({
  wishlists: PRODUCTS.map((p, i) => ({
    id: String(200 + i),
    productId: Number(p.id),
    searchAfter: [String(200 + i)],
    product: {
      id: p.id,
      title: p.title,
      price: p.price,
      isHot: p.isHot,
      isEnd: i === 2,
      isPrivate: false,
      postedAt: minutesAgo(60 * (i + 1)),
      hotDealType: null,
      isYearLowest: false,
      thumbnail: p.thumbnail,
      isMyWishlist: true,
      categoryId: p.categoryId,
    },
  })),
});

// 수기 문서(usePushSetting·theme.service)는 생성 타입이 없어 모양만 맞춘다.
const pushSetting = () => ({
  pushSetting: {
    keywordAlert: true,
    keywordAlertLevel: 'ALL',
    marketing: false,
    nightAlerts: false,
    communityAlert: true,
    emailDigest: false,
    quietHoursStart: 23,
    quietHoursEnd: 7,
  },
});

type Data = object;

export const USER_FIXTURES: Record<string, (variables: Record<string, unknown>) => Data> = {
  QueryMe: me,
  QueryMypageKeyword: keywords,
  QueryNotifications: notifications,
  QueryUnreadNotificationsCount: (): QueryUnreadNotificationsCountQuery => ({
    unreadNotificationsCount: 1,
  }),
  QueryWishlists: (v) => (v.searchAfter ? { wishlists: [] } : wishlists()),
  QueryWishlistCount: (): QueryWishlistCountQuery => ({ wishlistCount: PRODUCTS.length }),
  QueryPushSetting: pushSetting,
  QueryMySubscribedThemeIds: () => ({ mySubscribedThemeIds: [] }),
  // 앱 이름들.
  QueryMyProfile: (): QueryMyProfileQuery => me(),
  MyFavoriteCategories: (): MyFavoriteCategoriesQuery => ({
    me: { id: '1', favoriteCategories: [1, 2] },
  }),
  QueryMyNotificationKeywords: (): QueryMyNotificationKeywordsQuery => ({
    notificationKeywordsByMe: keywords().notificationKeywordsByMe.map((k, i) => ({
      ...k,
      minPrice: i === 1 ? 250000 : null,
      maxPrice: i === 1 ? 320000 : null,
      excludeKeywords: i === 0 ? ['리필'] : null,
    })),
  }),
  QueryMyPushSetting: (): QueryMyPushSettingQuery => ({
    pushSetting: {
      ...pushSetting().pushSetting,
      keywordAlertLevel: 'ALL' as QueryMyPushSettingQuery['pushSetting']['keywordAlertLevel'],
    },
  }),
  // 알림함 「좋은 가격만 받기」 제안(수기 문서 good-price.service).
  QueryGoodPriceSuggestion: (v) => ({
    goodPriceSuggestion: {
      keyword: String(v.keyword ?? '세제'),
      priced: true,
      watching: false,
      unit: 'TOTAL',
      goodPrice: 8900,
      goodDealCount: 4,
      rawMatchCount: 12,
      windowDays: 90,
    },
  }),
};
