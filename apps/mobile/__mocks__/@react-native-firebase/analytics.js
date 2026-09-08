/**
 * GA4(Firebase Analytics) 자동 mock.
 *
 * 🔴왜 필요한가: `jest.config.js` 의 `transformIgnorePatterns` 는
 * `@react-native-firebase/*` 를 변환 대상에 넣지 않는다(`mixpanel-react-native`
 * 만 있다). 그래서 `shared/lib/analytics/ga4.ts` 를 **간접적으로라도** 끌어오는
 * 테스트가 전부 "Jest encountered an unexpected token" 으로 죽는다.
 *
 * ⚠️패턴을 넓히는 건 답이 아니다 — 파싱은 지나가도 네이티브 모듈이 jest 환경에
 * 없어 런타임에서 다시 죽는다(이 레포는 gesture-handler·sentry 등도 mock 으로
 * 처리해 왔다). node_modules 패키지의 mock 을 `__mocks__` 에 두면 **모든 테스트가
 * 자동으로** 이걸 쓴다 — 파일마다 jest.mock 을 붙이지 않아도 된다.
 *
 * 분석 호출은 전부 fire-and-forget 이라 resolve 만 해 주면 충분하다.
 */
const logEvent = jest.fn(() => Promise.resolve());
const setUserId = jest.fn(() => Promise.resolve());

const analytics = jest.fn(() => ({logEvent, setUserId}));

module.exports = {
  __esModule: true,
  default: analytics,
  // 테스트에서 호출 여부를 보고 싶을 때 쓸 수 있게 노출한다.
  __mockFns: {logEvent, setUserId},
};
