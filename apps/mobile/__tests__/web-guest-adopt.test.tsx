import * as ReactTestRenderer from 'react-test-renderer';

import {useAdoptWebGuest} from '../src/screens/auth/useAdoptWebGuest';
import {
  __resetWebGuestHandoffForTest,
  offerWebGuestHandoff,
  readWebGuestDeviceId,
} from '../src/shared/lib/auth/web-guest-handoff';

/**
 * 웹 게스트 → 앱 이어받기(2026-10-12). 웹에서 게스트로 건 키워드가 앱에 오게, 「앱 열기」 링크의 gd 로
 * 같은 게스트를 받는다. 지키는 것: 회원·키워드 있는 앱 게스트는 건드리지 않는다, 실패하면 기기 id 를 되돌린다.
 */

const mockGetMyKeywords = jest.fn();
const mockGuestLogin = jest.fn();
const mockGetDeviceId = jest.fn();
const mockSyncDeviceId = jest.fn();
const mockHandleLoginSuccess = jest.fn();
const mockTrack = jest.fn();
const mockShowNow = jest.fn();
const mockToast = jest.fn();
const mockRefetch = jest.fn();
const mockRemove = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    refetchQueries: mockRefetch,
    removeQueries: mockRemove,
  }),
}));
jest.mock('../src/entities/auth', () => ({
  AuthQueries: {keys: {loginByRefreshToken: () => ['auth', 'login']}},
}));
jest.mock('../src/shared/api/auth/auth.service', () => ({
  AuthService: {guestLogin: () => mockGuestLogin()},
}));
jest.mock('../src/shared/api/mypage', () => ({
  MyPageService: {getMyKeywords: () => mockGetMyKeywords()},
}));
jest.mock('../src/shared/components/PushPermissionPrePrompt', () => ({
  showPushPrePromptNow: () => mockShowNow(),
}));
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: (...args: unknown[]) => mockTrack(...args)},
}));
jest.mock('../src/shared/lib/device/device-id', () => ({
  getDeviceId: () => mockGetDeviceId(),
  syncDeviceIdFromWeb: (id: string) => mockSyncDeviceId(id),
}));
jest.mock('../src/shared/lib/feedback', () => ({
  showToast: {success: (msg: string) => mockToast(msg)},
}));
jest.mock('../src/shared/lib/persistence/query-cache', () => ({
  dropAccountQueries: jest.fn(),
}));
jest.mock('../src/screens/auth/useSocialLogin/lib', () => ({
  handleLoginSuccess: (...args: unknown[]) => mockHandleLoginSuccess(...args),
}));

const WEB_ID = '8f14e45f-ceea-467a-9575-5b1c9b3c2a10';
const APP_ID = '1c9b3c2a-5b1c-4c9b-8f14-e45fceea4675';

type Props = {ready: boolean; isLogin: boolean; isMember: boolean};

function Probe(props: Props) {
  useAdoptWebGuest(props);
  return null;
}

const flush = async (cycles = 20) => {
  for (let i = 0; i < cycles; i += 1) {
    await Promise.resolve();
  }
};

async function render(props: Props) {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe {...props} />);
    await flush();
  });
}

async function offer(url: string) {
  await ReactTestRenderer.act(async () => {
    offerWebGuestHandoff(url);
    await flush();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  __resetWebGuestHandoffForTest();
  mockGetDeviceId.mockResolvedValue(APP_ID);
  mockGuestLogin.mockResolvedValue({
    guestLogin: {accessToken: 'a', refreshToken: 'r'},
  });
});

describe('readWebGuestDeviceId', () => {
  it('안드로이드 intent 쿼리·iOS 해시 둘 다 읽는다', () => {
    expect(
      readWebGuestDeviceId(
        `https://jirum-alarm.com/products/1?handoff=detail_header&gd=${WEB_ID}`,
      ),
    ).toBe(WEB_ID);
    expect(
      readWebGuestDeviceId(
        `https://jirum-alarm.com/products/1#handoff=detail_header&gd=${WEB_ID}`,
      ),
    ).toBe(WEB_ID);
  });
  it('기기 id 모양이 아니면 버린다', () => {
    expect(readWebGuestDeviceId('https://x/products/1?gd=<script>')).toBeNull();
    expect(readWebGuestDeviceId('https://x/products/1?handoff=x')).toBeNull();
  });
});

it('빈 앱 게스트면 웹 게스트로 바꾸고, 이어받은 키워드가 있으면 알리고 권한 안내를 띄운다', async () => {
  mockGetMyKeywords
    .mockResolvedValueOnce([]) // 지금 앱 게스트 = 빈 게스트
    .mockResolvedValueOnce([{keyword: '맥북'}, {keyword: '에어팟'}]); // 이어받은 뒤
  await render({ready: true, isLogin: true, isMember: false});
  await offer(`https://jirum-alarm.com/products/1?gd=${WEB_ID}`);

  expect(mockSyncDeviceId).toHaveBeenCalledWith(WEB_ID);
  expect(mockHandleLoginSuccess).toHaveBeenCalledWith('a', 'r', {guest: true});
  expect(mockTrack).toHaveBeenCalledWith('web_guest_adopt', {
    result: 'adopted',
  });
  expect(mockToast).toHaveBeenCalledWith(
    '웹에서 등록한 ‘맥북’ 외 1개 알림을 이어받았어요.',
  );
  expect(mockShowNow).toHaveBeenCalledTimes(1);
});

it('회원이면 건드리지 않는다', async () => {
  await render({ready: true, isLogin: true, isMember: true});
  await offer(`https://jirum-alarm.com/products/1?gd=${WEB_ID}`);
  expect(mockGuestLogin).not.toHaveBeenCalled();
  expect(mockTrack).toHaveBeenCalledWith('web_guest_adopt', {
    result: 'skipped_member',
  });
});

it('앱 게스트에 키워드가 있으면 건드리지 않는다(앱에서 건 알림을 잃지 않게)', async () => {
  mockGetMyKeywords.mockResolvedValue([{keyword: '캠핑'}]);
  await render({ready: true, isLogin: true, isMember: false});
  await offer(`https://jirum-alarm.com/products/1?gd=${WEB_ID}`);
  expect(mockSyncDeviceId).not.toHaveBeenCalled();
  expect(mockGuestLogin).not.toHaveBeenCalled();
});

it('게스트 발급이 실패하면 기기 id 를 되돌린다', async () => {
  mockGetMyKeywords.mockResolvedValue([]);
  mockGuestLogin.mockRejectedValue(new Error('network'));
  await render({ready: true, isLogin: true, isMember: false});
  await offer(`https://jirum-alarm.com/products/1?gd=${WEB_ID}`);
  expect(mockSyncDeviceId).toHaveBeenNthCalledWith(1, WEB_ID);
  expect(mockSyncDeviceId).toHaveBeenNthCalledWith(2, APP_ID);
  expect(mockHandleLoginSuccess).not.toHaveBeenCalled();
});

it('세션 판단 전(ready=false)에 온 링크는 맡겨 뒀다가 준비되면 처리한다', async () => {
  mockGetMyKeywords.mockResolvedValue([]);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <Probe ready={false} isLogin={false} isMember={false} />,
    );
    await flush();
  });
  await offer(`https://jirum-alarm.com/products/1?gd=${WEB_ID}`);
  expect(mockGuestLogin).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    renderer?.update(<Probe ready isLogin isMember={false} />);
    await flush();
  });
  expect(mockGuestLogin).toHaveBeenCalledTimes(1);
});
