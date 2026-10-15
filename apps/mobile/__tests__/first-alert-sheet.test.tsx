import React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import FirstAlertSheet from '../src/features/keyword-prompt/ui/FirstAlertSheet';
import {isFirstAlertDue} from '../src/shared/lib/first-alert';

/**
 * 첫 실행 알림 시트(2026-10-15). 로그인 벽을 없앤 뒤 게스트의 3%만 키워드를 걸었다 — 그 칸을 메우는 시트.
 * 지키는 것: 키워드 없는 게스트에게만·한 번만, 고른 것만 등록, 등록 뒤에만 OS 권한을 묻는다.
 */

const mockStorage = new Map<string, unknown>();
const mockGetMyKeywords = jest.fn();
const mockRecommended = jest.fn();
const mockAdd = jest.fn();
const mockRequestPermission = jest.fn();
const mockTrack = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockInvalidate = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));
jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: async (key: string) => mockStorage.get(key) ?? null,
  setAsyncStorage: async (key: string, value: unknown) => {
    mockStorage.set(key, value);
  },
}));
jest.mock('../src/shared/api/mypage', () => ({
  MyPageService: {getMyKeywords: () => mockGetMyKeywords()},
}));
jest.mock('../src/shared/api/home/home.service', () => ({
  HomeService: {getRecommendedKeywords: () => mockRecommended()},
}));
jest.mock('../src/shared/api/product/product.service', () => ({
  ProductService: {
    addNotificationKeyword: (v: {keyword: string}) => mockAdd(v),
  },
}));
jest.mock('../src/shared/lib/fcm/push-permission', () => ({
  requestPushPermissionIfNeeded: (source: string) =>
    mockRequestPermission(source),
}));
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: (...args: unknown[]) => mockTrack(...args)},
}));
jest.mock('../src/shared/lib/feedback', () => ({
  showToast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));
jest.mock('../src/features/keyword-prompt/model/myKeywords', () => ({
  invalidateMyKeywords: () => mockInvalidate(),
  openKeywordSettings: jest.fn(),
}));
// 시트·칩·버튼은 모양이 아니라 흐름만 본다 — 누를 수 있는 껍데기로 바꾼다.
jest.mock('../src/shared/components/BottomSheet', () => {
  const {View} = jest.requireActual('react-native');
  return ({visible, children}: {visible: boolean; children: React.ReactNode}) =>
    visible ? <View testID="sheet">{children}</View> : null;
});
jest.mock('../src/shared/components/ui/Chip', () => {
  const {Text} = jest.requireActual('react-native');
  return ({label, onPress}: {label: string; onPress: () => void}) => (
    <Text testID={`chip-${label}`} onPress={onPress}>
      {label}
    </Text>
  );
});
jest.mock('../src/shared/components/ui/Button', () => {
  const {Text} = jest.requireActual('react-native');
  return ({
    children,
    onPress,
    disabled,
  }: {
    children: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <Text
      testID={`button-${String(children)}`}
      onPress={disabled ? undefined : onPress}>
      {children}
    </Text>
  );
});

const flush = async (cycles = 20) => {
  for (let i = 0; i < cycles; i += 1) {
    await Promise.resolve();
  }
};

let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

async function mountAndWait() {
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<FirstAlertSheet />);
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1500);
    await flush();
  });
  return renderer as unknown as ReactTestRenderer.ReactTestRenderer;
}

const press = async (
  r: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) => {
  await ReactTestRenderer.act(async () => {
    r.root.findAllByProps({testID})[0].props.onPress?.();
    await flush();
  });
};

const sheetShown = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAllByProps({testID: 'sheet'}).length > 0;

beforeEach(() => {
  jest.useFakeTimers();
  mockStorage.clear();
  jest.clearAllMocks();
  mockGetMyKeywords.mockResolvedValue([]);
  mockRecommended.mockResolvedValue(['생수', '기저귀', '에어팟']);
  mockAdd.mockResolvedValue({});
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
  renderer = null;
  jest.useRealTimers();
});

describe('isFirstAlertDue', () => {
  it('키워드 없는 게스트에게만 true', async () => {
    mockStorage.set('isGuest', '1');
    expect(await isFirstAlertDue()).toBe(true);
  });

  it('회원(게스트 아님)은 false — 좋은 딜 푸시가 있어 기존 사전 안내가 맞다', async () => {
    expect(await isFirstAlertDue()).toBe(false);
  });

  it('키워드가 이미 있으면 false(웹에서 이어받은 게스트 등)', async () => {
    mockStorage.set('isGuest', '1');
    mockGetMyKeywords.mockResolvedValue([{keyword: '생수'}]);
    expect(await isFirstAlertDue()).toBe(false);
  });

  it('한 번 보여 줬으면 false', async () => {
    mockStorage.set('isGuest', '1');
    mockStorage.set('firstAlertShown', true);
    expect(await isFirstAlertDue()).toBe(false);
  });

  it('조회가 실패하면 false — 앱을 막지 않는다', async () => {
    mockStorage.set('isGuest', '1');
    mockGetMyKeywords.mockRejectedValue(new Error('network'));
    expect(await isFirstAlertDue()).toBe(false);
  });
});

describe('FirstAlertSheet', () => {
  it('고른 키워드만 등록하고, 등록 뒤에 OS 권한을 묻는다', async () => {
    mockStorage.set('isGuest', '1');
    const r = await mountAndWait();
    expect(sheetShown(r)).toBe(true);
    expect(mockStorage.get('firstAlertShown')).toBe(true);

    // 고르기 전엔 버튼이 안 눌린다.
    await press(r, 'button-골라 주세요');
    expect(mockAdd).not.toHaveBeenCalled();

    await press(r, 'chip-생수');
    await press(r, 'chip-에어팟');
    await press(r, 'button-2개 알림 받기');

    expect(mockAdd.mock.calls.map(([v]) => v.keyword)).toEqual([
      '생수',
      '에어팟',
    ]);
    expect(mockRequestPermission).toHaveBeenCalledWith('first_alert');
    expect(mockStorage.get('pushPrePromptShown')).toBe(true);
    expect(mockInvalidate).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "'생수' 외 1개 알림을 등록했어요.",
    );
    expect(mockTrack).toHaveBeenCalledWith('keyword_register', {
      source: 'first_alert',
      keyword: '생수',
    });
    expect(sheetShown(r)).toBe(false);
  });

  it('전부 실패하면 권한을 묻지 않는다(받을 알림이 없다)', async () => {
    mockStorage.set('isGuest', '1');
    mockAdd.mockRejectedValue(new Error('fail'));
    const r = await mountAndWait();
    await press(r, 'chip-생수');
    await press(r, 'button-1개 알림 받기');
    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalled();
  });

  it('「나중에」는 등록·권한 없이 닫는다', async () => {
    mockStorage.set('isGuest', '1');
    const r = await mountAndWait();
    await press(r, 'button-나중에');
    expect(mockAdd).not.toHaveBeenCalled();
    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(sheetShown(r)).toBe(false);
  });

  it('추천이 비면 띄우지 않고 본 것으로도 치지 않는다', async () => {
    mockStorage.set('isGuest', '1');
    mockRecommended.mockResolvedValue([]);
    const r = await mountAndWait();
    expect(sheetShown(r)).toBe(false);
    expect(mockStorage.get('firstAlertShown')).toBeUndefined();
  });

  it('회원에겐 띄우지 않는다', async () => {
    const r = await mountAndWait();
    expect(sheetShown(r)).toBe(false);
    expect(mockRecommended).not.toHaveBeenCalled();
  });
});
