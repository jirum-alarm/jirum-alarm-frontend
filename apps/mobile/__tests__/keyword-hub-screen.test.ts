/**
 * 키워드 허브 화면(KeywordHubScreen) — 들어오는 길 세 개(내 키워드·검색 요약 줄·딥링크)와 web 과 같은 문장.
 *
 * navigate/push 는 처리 못 해도 던지지 않는다(콘솔 에러만) — 라우트가 루트 스택에 없으면 버튼을 눌러도 조용히 아무 일도
 * 안 일어난다. 그래서 "어디에 등록됐고 누가 그 이름으로 보내나"를 소스로 고정한다.
 */
import {
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  findKeywordHubForQuery,
  type KeywordHubSummary,
} from '../src/entities/keyword-hub/lib/keyword-hub';
import {
  resolveNativeRoute,
  type NativeRoute,
} from '../src/shared/lib/navigation/tab-routing';
import {splitBoxText} from '../src/shared/lib/styling';
import {tabStackNavigations} from '../src/shared/constant/navigations';

const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const hub = (extra: Partial<KeywordHubSummary>): KeywordHubSummary => ({
  slug: '삼다수',
  name: '삼다수',
  aliases: [],
  recentDealCount: 103,
  countCapped: false,
  activeDays: 25,
  topSources: [{name: '뽐뿌', share: 22}],
  ...extra,
});

describe('내 키워드 → 허브: 키워드가 허브 자체일 때만(서버 isKeywordHubQuery 와 같은 같음 비교)', () => {
  const hubs: KeywordHubSummary[] = [
    hub({}),
    hub({slug: 'ps5', name: 'PS5', aliases: ['플스5']}),
  ];

  it.each([
    ['삼다수', '삼다수'],
    ['ps5', 'ps5'],
    ['플스 5', 'ps5'],
    [' PS 5 ', 'ps5'],
  ])('%s → %s', (keyword: string, slug: string) => {
    expect(findKeywordHubForQuery(keyword, hubs)?.slug).toBe(slug);
  });

  it.each(['삼다수 2L', '제주 삼다수', 'ps5 프로', ''])(
    '%s 는 허브가 아니다(포함이 아니라 같음)',
    (keyword: string) => {
      expect(findKeywordHubForQuery(keyword, hubs)).toBeUndefined();
    },
  );
});

describe('문장 — @jirum/domain 한 곳(웹 허브와 같은 말)', () => {
  it('머리 한 줄·리듬', () => {
    const h: KeywordHubSummary = hub({});
    expect(buildKeywordHubLead(h)).toBe(
      '최근 30일 동안 커뮤니티·쇼핑몰 특가에 올라온 삼다수 핫딜 103건을 모았어요.',
    );
    expect(describeKeywordHubRhythm(h)?.headline).toBe(
      '최근 30일 중 25일 올라왔어요',
    );
  });

  it('web 허브(아직 자기 복사본을 쓴다)와 문장이 한 글자도 다르지 않다', () => {
    const webLib = readWeb('entities/keyword-hub/lib/keyword-hub.ts');
    const domain = read('../../packages/domain/src/keyword-hub.ts');
    for (const phrase of [
      '일 올라왔어요`',
      '핫딜은 거의 매일 올라와요. 급하지 않다면 알림을 걸어 두고 마음에 드는 딜을 골라도 돼요.',
      '핫딜은 매일 올라오지는 않아요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.',
      'windowDays * 0.7',
      '일 동안 커뮤니티·쇼핑몰 특가에 올라온 ${hub.name} 핫딜 ',
      '커뮤니티·쇼핑몰 특가에 올라오는 ${hub.name} 핫딜을 모아 보여드려요.',
    ]) {
      expect(webLib).toContain(phrase);
      expect(domain).toContain(phrase);
    }
  });
});

describe('딥링크 /keywords/{slug} → 네이티브 허브', () => {
  const expected: NativeRoute = {
    tab: 'HomeTab',
    screen: tabStackNavigations.KEYWORD_HUB,
    params: {slug: '삼다수'},
  };

  it.each([
    'https://jirum-alarm.com/keywords/%EC%82%BC%EB%8B%A4%EC%88%98',
    'https://jirum-alarm.com/keywords/%EC%82%BC%EB%8B%A4%EC%88%98/',
    '/keywords/%EC%82%BC%EB%8B%A4%EC%88%98?utm_source=push',
    '/keywords/삼다수',
  ])('%s', (url: string) => {
    expect(resolveNativeRoute(url)).toEqual(expected);
  });

  it('잘못된 인코딩이어도 던지지 않는다', () => {
    expect(resolveNativeRoute('/keywords/%E')?.params).toEqual({slug: '%E'});
  });

  it('목록(/keywords)은 네이티브가 없다 — 푸시·딥링크면 웹뷰로', () => {
    expect(
      resolveNativeRoute('/keywords', {allowWebViewRoute: true})?.screen,
    ).toBe(tabStackNavigations.WEBVIEW);
  });
});

describe('라우트 등록·들어오는 길', () => {
  it('허브는 루트 스택에 있다 — 검색 스택 안에서 push 해도 부모가 받는다', () => {
    const root = read('src/navigations/stack/MainNavigator.tsx');
    expect(root).toContain('name={tabStackNavigations.KEYWORD_HUB}');
    expect(root).toContain('component={KeywordHubScreen}');
    expect(read('src/navigations/tab/SearchStackNavigator.tsx')).not.toContain(
      'KEYWORD_HUB',
    );
  });

  it('검색 요약 줄은 액션으로 보낸다(검색 스택 타입엔 허브가 없다)', () => {
    const summary = read('src/screens/search/ui/SearchKeywordHubSummary.tsx');
    expect(summary).toContain(
      'StackActions.push(tabStackNavigations.KEYWORD_HUB',
    );
    expect(summary).toContain("'keyword_hub_card_click'");
  });

  it('내 키워드는 허브인 키워드에만 「핫딜 모아보기」를 단다', () => {
    const screen = read('src/screens/mypage/KeywordScreen.tsx');
    expect(screen).toContain('findKeywordHubForQuery(keyword.keyword, hubs)');
    expect(screen).toContain(
      'onOpenHub={hub ? () => openHub(hub) : undefined}',
    );
    expect(screen).toContain('navigation.push(tabStackNavigations.KEYWORD_HUB');
    expect(read('src/features/mypage/ui/KeywordItem.tsx')).toContain(
      '핫딜 모아보기 ›',
    );
  });

  it('알림 버튼은 web 허브와 같은 계측 이름·값', () => {
    const button = read('src/screens/keyword-hub/ui/KeywordHubAlertButton.tsx');
    const web = readWeb('widgets/keyword-hub/ui/KeywordHubAlertButton.tsx');
    for (const s of ["'keyword_prompt_view'", "'keyword_prompt_click'"]) {
      expect(button).toContain(s);
      expect(web).toContain(s);
    }
    expect(button).toContain("'keyword_hub'");
    expect(read('src/shared/lib/analytics/keyword-tracking.ts')).toContain(
      "| 'keyword_hub'",
    );
  });
});

describe('splitBoxText — web 한 줄 레시피를 겉·글자로', () => {
  it('글자 클래스는 Text 로, hover: 는 버린다', () => {
    const parts: {box: string; text: string} = splitBoxText(
      'rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50',
    );
    expect(parts).toEqual({
      box: 'rounded-full border border-gray-200 px-3 py-1.5',
      text: 'text-sm text-gray-700',
    });
  });
});

export {};
