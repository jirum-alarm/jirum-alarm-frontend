/**
 * 카톡방 사람을 앱 알림으로 잇는 다리(2026-10-15, vault domain/kakao-to-app-bridge.md C1).
 *
 * 카톡방 링크는 카톡 인앱 브라우저로 열린다. 여기선 웹 푸시가 안 되고, 크롬·사파리와 저장소도 따로라
 * 다른 곳에서 로그인했어도 손님이다. 그래서 키워드를 걸어도 받을 통로가 없었다 —
 * 10/14 실측: 카톡 발송 직후 1시간 안에 그 딜을 연 기기 1,295개 중 앱 토큰이 붙은 건 0.3%,
 * 카톡에서 키워드를 건 게스트 6명은 토큰 0개. 구매 후 권유는 카톡 사람의 75%가 봤는데(1인 10.7회) 클릭 11명.
 * 여기선 등록 뒤 「어디로 받을까요」(웹 푸시·브라우저 넘기기) 대신 곧장 앱으로 보낸다 — 게스트 기기 id(gd)를 실어
 * 앱이 같은 게스트로 이어받으면 방금 건 키워드가 앱 알림으로 온다(apps/mobile useAdoptWebGuest).
 *
 * 끄기: 런타임 env NEXT_PUBLIC_KAKAO_BRIDGE=off(gitops, 재빌드 없음). 비어 있으면 켜짐 — 판정은 kakao-bridge-ua.ts.
 * 판독: crawling-server experiment-registry obs_kakao_app_bridge.
 *
 * import 없이 둔다 — kakao-bridge.test.ts 가 맨 node 로 돈다(okachat.ts 와 같은 이유).
 */

/** 카톡 인앱이고 우리 앱 웹뷰가 아니고 스위치가 켜져 있으면 true. */
export const kakaoBridgeApplies = ({
  kakaoInApp,
  jirumApp,
  on,
}: {
  kakaoInApp: boolean;
  jirumApp: boolean;
  on: boolean;
}): boolean => on && kakaoInApp && !jirumApp;

/**
 * 같은 권유를 하루 한 번만 — 카톡 사람은 구매 클릭마다 같은 권유를 봐서(1인 10.7회, 노출당 클릭 0.18%) 배경이 됐다.
 * 저장소를 못 쓰면 보여 준다(한 번 더 보는 쪽이 안 보이는 것보다 낫다).
 */
const SEEN_KEY = 'jirum:kakao-bridge-seen';

const todayKst = (now: Date): string =>
  new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);

export const seenKakaoBridgeToday = (
  storage: Pick<Storage, 'getItem'> | null,
  now: Date = new Date(),
): boolean => {
  try {
    return storage?.getItem(SEEN_KEY) === todayKst(now);
  } catch {
    return false;
  }
};

export const markKakaoBridgeSeen = (
  storage: Pick<Storage, 'setItem'> | null,
  now: Date = new Date(),
): void => {
  try {
    storage?.setItem(SEEN_KEY, todayKst(now));
  } catch {
    // 저장소를 못 쓰면 하루 한 번 제한 없이 보인다.
  }
};
